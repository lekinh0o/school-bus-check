import type { Dispatch } from '@reduxjs/toolkit';

import { applyImportPlan, type ApplySummary, type ExcelStoreState } from './apply';
import { allPlanRows, blockingCount, canImportAll, eligibleCount } from './overlay';
import { rebuildSession, type ImportReviewSession } from './session';
import { isEligibleRow, type ImportPlan, type ImportSnapshot } from './types';

export type ImportMode = 'importAll' | 'importEligible';

export type ConfirmFailure = {
  ok: false;
  reason: 'blocked' | 'needs_explicit' | 'no_eligible' | 'revalidation_conflict' | 'apply_error';
  session: ImportReviewSession;
  error?: string;
};

export type ConfirmSuccess = {
  ok: true;
  session: ImportReviewSession;
  summary: ApplySummary;
};

export type ConfirmResult = ConfirmSuccess | ConfirmFailure;

export function persistableFingerprint(plan: ImportPlan): string {
  return allPlanRows(plan)
    .filter(isEligibleRow)
    .map(
      (row) =>
        `${row.rowKey}:${row.operation}:${row.entityId ?? ''}:${JSON.stringify(row.create ?? row.changes ?? {})}`,
    )
    .sort()
    .join('\n');
}

export function confirmationCounts(plan: ImportPlan) {
  const eligible = eligibleCount(plan);
  const blocking = blockingCount(plan);
  const ignored = allPlanRows(plan).filter((row) => row.decision === 'ignore').length;
  const news = allPlanRows(plan).filter(
    (row) => row.decision === 'include' && row.operation === 'create' && row.validation === 'valid',
  ).length;
  const updates = allPlanRows(plan).filter(
    (row) => row.decision === 'include' && row.operation === 'update' && row.validation === 'valid',
  ).length;
  return {
    eligible,
    blocking,
    ignored,
    news,
    updates,
    canImportAll: canImportAll(plan),
  };
}

export function confirmImportPlan(args: {
  session: ImportReviewSession;
  snapshot: ImportSnapshot;
  mode: ImportMode;
  explicitEligible?: boolean;
  dispatch: Dispatch;
  getState: () => ExcelStoreState;
}): ConfirmResult {
  const rebuilt = rebuildSession(args.session, args.snapshot, args.session.overlay);
  const counts = confirmationCounts(rebuilt.plan);

  if (args.mode === 'importAll' && !counts.canImportAll) {
    return { ok: false, reason: 'blocked', session: rebuilt };
  }
  if (args.mode === 'importEligible') {
    if (!args.explicitEligible) {
      return { ok: false, reason: 'needs_explicit', session: rebuilt };
    }
    if (counts.eligible === 0) {
      return { ok: false, reason: 'no_eligible', session: rebuilt };
    }
  }

  if (persistableFingerprint(args.session.plan) !== persistableFingerprint(rebuilt.plan)) {
    return { ok: false, reason: 'revalidation_conflict', session: rebuilt };
  }

  try {
    const summary = applyImportPlan(args.dispatch, args.getState, rebuilt.plan);
    return { ok: true, session: rebuilt, summary };
  } catch (error) {
    return {
      ok: false,
      reason: 'apply_error',
      session: rebuilt,
      error: error instanceof Error ? error.message : 'Falha ao persistir',
    };
  }
}
