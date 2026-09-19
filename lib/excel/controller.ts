import type { Dispatch } from '@reduxjs/toolkit';

import type { ExcelStoreState } from './apply';
import {
  confirmImportPlan,
  confirmationCounts,
  type ConfirmResult,
  type ImportMode,
} from './confirm';
import type { ExcelEntityKind } from './contract';
import {
  DraftReadError,
  SerialJournalWriter,
  journalFromOverlay,
  type DraftStore,
} from './draft';
import { allPlanRows } from './overlay';
import {
  createSession,
  rebuildSession,
  removeRowCorrection,
  saveRowCorrections,
  sessionFromDraft,
  setRowDecision,
  type ImportReviewSession,
} from './session';
import type { ImportCorrection, ImportSnapshot, RowDecision } from './types';
import { isEligibleRow } from './types';
import { parseWorkbookBuffer } from './workbook';
import {
  filterPlanRows,
  findRow,
  nextProblemRow,
  type ReviewFilter,
} from './reviewModel';

export type ReviewStep =
  | 'analysis'
  | 'review'
  | 'correction'
  | 'correction-feedback'
  | 'confirmation';

export type DraftOffer = 'none' | 'resume' | 'unrecoverable';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'save_error';

export type ReviewViewState = {
  step: ReviewStep;
  session: ImportReviewSession | null;
  draftOffer: DraftOffer;
  unrecoverableReason?: string;
  selectedRowKey?: string;
  filter: ReviewFilter;
  query: string;
  saveStatus: SaveStatus;
  saveError?: string;
  lastFeedback?: { rowKey: string; success: boolean };
  result?: ConfirmResult;
  busy: boolean;
  flushingBackground: boolean;
};

function initialView(): ReviewViewState {
  return {
    step: 'analysis',
    session: null,
    draftOffer: 'none',
    filter: 'problems',
    query: '',
    saveStatus: 'idle',
    busy: false,
    flushingBackground: false,
  };
}

export class ImportReviewController {
  private view: ReviewViewState = initialView();
  private readonly writer: SerialJournalWriter;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly draft: DraftStore) {
    this.writer = new SerialJournalWriter(draft);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): ReviewViewState {
    return this.view;
  }

  private assign(next: ReviewViewState): void {
    this.view = next;
    for (const listener of this.listeners) {
      listener();
    }
  }

  visibleRows() {
    if (!this.view.session) {
      return [];
    }
    return filterPlanRows(this.view.session.plan, this.view.filter, this.view.query);
  }

  async detectDraft(): Promise<DraftOffer> {
    try {
      const active = await this.draft.hasActive();
      if (!active) {
        this.assign({ ...this.view, draftOffer: 'none', unrecoverableReason: undefined });
        return 'none';
      }
      await this.draft.read();
      this.assign({ ...this.view, draftOffer: 'resume', unrecoverableReason: undefined });
      return 'resume';
    } catch (error) {
      const reason =
        error instanceof DraftReadError
          ? error.message
          : 'Rascunho não recuperável';
      this.assign({
        ...this.view,
        draftOffer: 'unrecoverable',
        unrecoverableReason: reason,
      });
      return 'unrecoverable';
    }
  }

  async startFromFile(
    snapshot: ImportSnapshot,
    source: Uint8Array,
    fileName: string,
    fileSize: number,
  ): Promise<void> {
    this.assign({ ...this.view, busy: true });
    const parsed = parseWorkbookBuffer(source);
    const session = createSession(snapshot, parsed, { fileName, fileSize });
    await this.draft.create(source, fileName, fileSize, journalFromOverlay(session.overlay));
    this.assign({
      ...initialView(),
      session,
      step: 'analysis',
      saveStatus: 'saved',
      busy: false,
    });
  }

  async resume(snapshot: ImportSnapshot): Promise<void> {
    this.assign({ ...this.view, busy: true });
    const files = await this.draft.read();
    if (!files) {
      this.assign({ ...this.view, busy: false, draftOffer: 'none' });
      return;
    }
    const session = sessionFromDraft(snapshot, files);
    this.assign({
      ...initialView(),
      session,
      step: 'analysis',
      saveStatus: 'saved',
      busy: false,
    });
  }

  async discard(): Promise<void> {
    await this.writer.flush();
    await this.draft.clear();
    this.assign(initialView());
  }

  resetAfterResult(): void {
    this.assign(initialView());
  }

  revalidate(snapshot: ImportSnapshot): void {
    if (!this.view.session) {
      return;
    }
    const session = rebuildSession(
      this.view.session,
      snapshot,
      this.view.session.overlay,
    );
    this.assign({ ...this.view, session });
  }

  goReview(): void {
    this.assign({ ...this.view, step: 'review' });
  }

  goAnalysis(): void {
    this.assign({ ...this.view, step: 'analysis', selectedRowKey: undefined });
  }

  goConfirmation(): void {
    this.assign({ ...this.view, step: 'confirmation' });
  }

  setFilter(filter: ReviewFilter): void {
    this.assign({ ...this.view, filter });
  }

  setQuery(query: string): void {
    this.assign({ ...this.view, query });
  }

  openCorrection(rowKey: string): void {
    this.assign({
      ...this.view,
      step: 'correction',
      selectedRowKey: rowKey,
      lastFeedback: undefined,
    });
  }

  backToReview(): void {
    this.assign({
      ...this.view,
      step: 'review',
      selectedRowKey: undefined,
      lastFeedback: undefined,
    });
  }

  async saveCorrections(
    snapshot: ImportSnapshot,
    kind: ExcelEntityKind,
    rowNumber: number,
    corrections: ImportCorrection[],
  ): Promise<void> {
    if (!this.view.session) {
      return;
    }
    const session = saveRowCorrections(
      this.view.session,
      snapshot,
      kind,
      rowNumber,
      corrections,
    );
    const row = findRow(session.plan, `${kind}:${rowNumber}`);
    const success = Boolean(row && isEligibleRow(row));
    this.assign({
      ...this.view,
      session,
      selectedRowKey: row?.rowKey,
      lastFeedback: row ? { rowKey: row.rowKey, success } : undefined,
      step: success ? 'correction-feedback' : 'correction',
      saveStatus: 'saving',
    });
    await this.persistJournal();
  }

  async undoField(
    snapshot: ImportSnapshot,
    kind: ExcelEntityKind,
    rowNumber: number,
    field: string,
  ): Promise<void> {
    if (!this.view.session) {
      return;
    }
    const session = removeRowCorrection(
      this.view.session,
      snapshot,
      kind,
      rowNumber,
      field,
    );
    this.assign({ ...this.view, session, saveStatus: 'saving' });
    await this.persistJournal();
  }

  async setDecision(
    snapshot: ImportSnapshot,
    kind: ExcelEntityKind,
    rowNumber: number,
    decision: RowDecision,
  ): Promise<void> {
    if (!this.view.session) {
      return;
    }
    const session = setRowDecision(
      this.view.session,
      snapshot,
      kind,
      rowNumber,
      decision,
    );
    const fromCorrection =
      this.view.step === 'correction' || this.view.step === 'correction-feedback';
    this.assign({
      ...this.view,
      session,
      saveStatus: 'saving',
      step: fromCorrection ? 'review' : this.view.step,
      selectedRowKey: fromCorrection ? undefined : this.view.selectedRowKey,
    });
    await this.persistJournal();
  }

  openNextProblem(): void {
    if (!this.view.session) {
      return;
    }
    const next = nextProblemRow(this.view.session.plan, this.view.selectedRowKey);
    if (!next) {
      this.backToReview();
      return;
    }
    this.openCorrection(next.rowKey);
  }

  async confirm(
    snapshot: ImportSnapshot,
    mode: ImportMode,
    dispatch: Dispatch,
    getState: () => ExcelStoreState,
    explicitEligible = false,
  ): Promise<ConfirmResult> {
    if (!this.view.session) {
      throw new Error('Nenhuma sessão ativa');
    }
    const result = confirmImportPlan({
      session: this.view.session,
      snapshot,
      mode,
      explicitEligible,
      dispatch,
      getState,
    });
    if (!result.ok) {
      this.assign({
        ...this.view,
        session: result.session,
        step: result.reason === 'revalidation_conflict' ? 'review' : this.view.step,
        result,
      });
      return result;
    }
    await this.writer.flush();
    await this.draft.clear();
    this.assign({
      ...this.view,
      session: result.session,
      result,
      draftOffer: 'none',
    });
    return result;
  }

  handleAppState(next: string): Promise<void> {
    if (next !== 'background' && next !== 'inactive') {
      return Promise.resolve();
    }
    if (this.writer.pending()) {
      this.assign({
        ...this.view,
        saveStatus: 'saving',
        flushingBackground: true,
      });
    }
    return this.flushPending();
  }

  async flushPending(): Promise<void> {
    await this.writer.flush();
    this.assign({
      ...this.view,
      saveStatus: this.writer.status === 'idle' ? this.view.saveStatus : this.writer.status,
      saveError: this.writer.lastError,
      flushingBackground: false,
    });
  }

  private async persistJournal(): Promise<void> {
    if (!this.view.session) {
      return;
    }
    try {
      await this.writer.enqueue(journalFromOverlay(this.view.session.overlay));
      this.assign({
        ...this.view,
        saveStatus: this.writer.status,
        saveError: undefined,
      });
    } catch {
      this.assign({
        ...this.view,
        saveStatus: 'save_error',
        saveError: this.writer.lastError,
      });
    }
  }
}

export function reviewCounts(session: ImportReviewSession | null) {
  if (!session) {
    return {
      eligible: 0,
      blocking: 0,
      ignored: 0,
      news: 0,
      updates: 0,
      canImportAll: false,
      rows: 0,
    };
  }
  return {
    ...confirmationCounts(session.plan),
    rows: allPlanRows(session.plan).length,
  };
}
