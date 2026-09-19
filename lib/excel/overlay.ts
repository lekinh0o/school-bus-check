import type { ExcelEntityKind } from './contract';
import type {
  EntityTotals,
  ImportCorrection,
  ImportIssue,
  ImportPlan,
  PlannedRow,
  ReviewOverlay,
  RowDecision,
  RowOperation,
  RowStatus,
  RowValidation,
} from './types';
import { rowKey } from './types';
import type { ParsedSheet, ParsedWorkbook } from './workbook';

export function emptyTotals(): EntityTotals {
  return {
    rows: 0,
    valid: 0,
    invalid: 0,
    news: 0,
    updates: 0,
    duplicates: 0,
    missingRefs: 0,
    errors: 0,
    conflicts: 0,
    ignored: 0,
    corrected: 0,
  };
}

export function applyOverlayToWorkbook(
  parsed: ParsedWorkbook,
  overlay: ReviewOverlay,
): ParsedWorkbook {
  const kinds: ExcelEntityKind[] = ['vehicles', 'schools', 'routes', 'students'];
  const sheets: ParsedWorkbook['sheets'] = {};
  for (const kind of kinds) {
    const sheet = parsed.sheets[kind];
    if (!sheet) {
      continue;
    }
    sheets[kind] = {
      ...sheet,
      rows: sheet.rows.map((row) => ({
        ...row,
        values: applyFieldCorrections(
          row.values,
          overlay.corrections[rowKey(kind, row.rowNumber)],
        ),
      })),
    };
  }
  return {
    ...parsed,
    sheets,
  };
}

export function applyFieldCorrections(
  values: Record<string, string>,
  corrections?: Record<string, ImportCorrection>,
): Record<string, string> {
  if (!corrections) {
    return { ...values };
  }
  const next = { ...values };
  for (const correction of Object.values(corrections)) {
    if (correction.correctedValue !== undefined) {
      next[correction.field] = correction.correctedValue;
    }
  }
  return next;
}

export function rowDecision(
  overlay: ReviewOverlay,
  kind: ExcelEntityKind,
  rowNumber: number,
): RowDecision {
  return overlay.decisions[rowKey(kind, rowNumber)] ?? 'include';
}

export function isIgnored(
  overlay: ReviewOverlay,
  kind: ExcelEntityKind,
  rowNumber: number,
): boolean {
  return rowDecision(overlay, kind, rowNumber) === 'ignore';
}

export function selectedRef(
  overlay: ReviewOverlay,
  kind: ExcelEntityKind,
  rowNumber: number,
  field: string,
): { id: string; label: string } | undefined {
  const correction = overlay.corrections[rowKey(kind, rowNumber)]?.[field];
  if (!correction?.selectedEntityId) {
    return undefined;
  }
  return {
    id: correction.selectedEntityId,
    label: correction.selectedEntityLabel ?? '',
  };
}

export function rowCorrections(
  overlay: ReviewOverlay,
  kind: ExcelEntityKind,
  rowNumber: number,
): ImportCorrection[] {
  return Object.values(overlay.corrections[rowKey(kind, rowNumber)] ?? {});
}

function statusToOperation(status: RowStatus, decision: RowDecision): RowOperation {
  if (decision === 'ignore') {
    return 'none';
  }
  if (status === 'new') {
    return 'create';
  }
  if (status === 'update') {
    return 'update';
  }
  return 'none';
}

function statusToValidation(status: RowStatus): RowValidation {
  if (status === 'new' || status === 'update') {
    return 'valid';
  }
  if (status === 'conflict' || status === 'duplicate') {
    return 'conflict';
  }
  if (status === 'missing_ref') {
    return 'error';
  }
  return 'error';
}

function issueFromRow(row: PlannedRow): ImportIssue[] {
  if (row.issues.length > 0) {
    return row.issues;
  }
  if (!row.message) {
    return [];
  }
  const severity: ImportIssue['severity'] =
    row.status === 'conflict' || row.status === 'duplicate' ? 'conflict' : 'error';
  return [
    {
      code: row.status,
      severity,
      field: row.field,
      message: row.message,
    },
  ];
}

export function hydrateRows(
  kind: ExcelEntityKind,
  rows: PlannedRow[],
  source: ParsedSheet | undefined,
  overlay: ReviewOverlay,
): PlannedRow[] {
  const originals = new Map(
    (source?.rows ?? []).map((row) => [row.rowNumber, row.values]),
  );
  return rows.map((row) => {
    const originalValues = { ...(originals.get(row.rowNumber) ?? row.originalValues) };
    const corrections = rowCorrections(overlay, kind, row.rowNumber);
    const decision = rowDecision(overlay, kind, row.rowNumber);
    const effectiveValues = applyFieldCorrections(
      originalValues,
      overlay.corrections[rowKey(kind, row.rowNumber)],
    );
    return {
      ...row,
      kind,
      rowKey: rowKey(kind, row.rowNumber),
      operation: statusToOperation(row.status, decision),
      validation: statusToValidation(row.status),
      decision,
      corrected: corrections.length > 0,
      issues: issueFromRow(row),
      originalValues,
      effectiveValues,
      corrections,
    };
  });
}

export function tally(rows: PlannedRow[]): EntityTotals {
  const totals = emptyTotals();
  totals.rows = rows.length;
  for (const row of rows) {
    if (row.corrected) {
      totals.corrected += 1;
    }
    if (row.decision === 'ignore') {
      totals.ignored += 1;
      continue;
    }
    if (row.status === 'new') {
      totals.news += 1;
      totals.valid += 1;
    } else if (row.status === 'update') {
      totals.updates += 1;
      totals.valid += 1;
    } else {
      totals.invalid += 1;
      if (row.status === 'duplicate') {
        totals.duplicates += 1;
      } else if (row.status === 'conflict') {
        totals.conflicts += 1;
      } else if (row.status === 'missing_ref') {
        totals.missingRefs += 1;
      } else {
        totals.errors += 1;
      }
    }
  }
  return totals;
}

export function allPlanRows(plan: ImportPlan): PlannedRow[] {
  return [...plan.vehicles, ...plan.schools, ...plan.routes, ...plan.students];
}

export function eligibleCount(plan: ImportPlan): number {
  return allPlanRows(plan).filter(
    (row) =>
      row.decision === 'include' &&
      row.validation === 'valid' &&
      (row.operation === 'create' || row.operation === 'update'),
  ).length;
}

export function blockingCount(plan: ImportPlan): number {
  return (
    plan.headerErrors.length +
    allPlanRows(plan).filter(
      (row) =>
        row.decision === 'include' &&
        (row.validation === 'error' || row.validation === 'conflict'),
    ).length
  );
}

export function canImportAll(plan: ImportPlan): boolean {
  return blockingCount(plan) === 0;
}
