import type { ExcelEntityKind } from './contract';
import { overlayFromJournal, type DraftFiles } from './draft';
import { blockingCount, canImportAll, eligibleCount } from './overlay';
import { buildImportPlanFromParsed } from './plan';
import type {
  ImportCorrection,
  ImportPlan,
  ImportSnapshot,
  ReviewOverlay,
  RowDecision,
} from './types';
import { emptyOverlay, rowKey } from './types';
import { parseWorkbookBuffer, type ParsedWorkbook } from './workbook';

export type ImportReviewSession = {
  source: ParsedWorkbook;
  fileName: string;
  fileSize: number;
  overlay: ReviewOverlay;
  plan: ImportPlan;
};

function cloneOverlay(overlay: ReviewOverlay): ReviewOverlay {
  const corrections: ReviewOverlay['corrections'] = {};
  for (const [key, fields] of Object.entries(overlay.corrections)) {
    corrections[key] = { ...fields };
  }
  return {
    corrections,
    decisions: { ...overlay.decisions },
  };
}

export function createSession(
  snapshot: ImportSnapshot,
  source: ParsedWorkbook,
  meta: { fileName: string; fileSize: number },
  overlay: ReviewOverlay = emptyOverlay(),
): ImportReviewSession {
  const plan = buildImportPlanFromParsed(snapshot, source, overlay);
  return {
    source,
    fileName: meta.fileName,
    fileSize: meta.fileSize,
    overlay,
    plan: {
      ...plan,
      fileName: meta.fileName,
      fileSize: meta.fileSize,
    },
  };
}

export function rebuildSession(
  session: ImportReviewSession,
  snapshot: ImportSnapshot,
  overlay: ReviewOverlay,
): ImportReviewSession {
  return createSession(snapshot, session.source, {
    fileName: session.fileName,
    fileSize: session.fileSize,
  }, overlay);
}

export function saveRowCorrections(
  session: ImportReviewSession,
  snapshot: ImportSnapshot,
  kind: ExcelEntityKind,
  rowNumber: number,
  corrections: ImportCorrection[],
): ImportReviewSession {
  const overlay = cloneOverlay(session.overlay);
  const key = rowKey(kind, rowNumber);
  const current = { ...(overlay.corrections[key] ?? {}) };
  for (const correction of corrections) {
    current[correction.field] = correction;
  }
  overlay.corrections[key] = current;
  return rebuildSession(session, snapshot, overlay);
}

export function removeRowCorrection(
  session: ImportReviewSession,
  snapshot: ImportSnapshot,
  kind: ExcelEntityKind,
  rowNumber: number,
  field: string,
): ImportReviewSession {
  const overlay = cloneOverlay(session.overlay);
  const key = rowKey(kind, rowNumber);
  const current = { ...(overlay.corrections[key] ?? {}) };
  delete current[field];
  if (Object.keys(current).length === 0) {
    delete overlay.corrections[key];
  } else {
    overlay.corrections[key] = current;
  }
  return rebuildSession(session, snapshot, overlay);
}

export function setRowDecision(
  session: ImportReviewSession,
  snapshot: ImportSnapshot,
  kind: ExcelEntityKind,
  rowNumber: number,
  decision: RowDecision,
): ImportReviewSession {
  const overlay = cloneOverlay(session.overlay);
  const key = rowKey(kind, rowNumber);
  if (decision === 'include') {
    delete overlay.decisions[key];
  } else {
    overlay.decisions[key] = decision;
  }
  return rebuildSession(session, snapshot, overlay);
}

export function sessionImportCounts(session: ImportReviewSession) {
  return {
    eligible: eligibleCount(session.plan),
    blocking: blockingCount(session.plan),
    canImportAll: canImportAll(session.plan),
  };
}

export function sessionFromDraft(
  snapshot: ImportSnapshot,
  files: DraftFiles,
): ImportReviewSession {
  return createSession(
    snapshot,
    parseWorkbookBuffer(files.source),
    {
      fileName: files.manifest.fileName,
      fileSize: files.manifest.fileSize,
    },
    overlayFromJournal(files.journal),
  );
}
