import type { Route, School, Student, Vehicle } from '../../types';

import type { ExcelEntityKind } from './contract';

export type ImportSnapshot = {
  vehicles: Vehicle[];
  schools: School[];
  routes: Route[];
  students: Student[];
};

export type RowStatus =
  | 'new'
  | 'update'
  | 'duplicate'
  | 'conflict'
  | 'missing_ref'
  | 'error';

export type RowOperation = 'create' | 'update' | 'none';
export type RowValidation = 'valid' | 'warning' | 'error' | 'conflict';
export type RowDecision = 'include' | 'ignore';
export type CorrectionOrigin =
  | 'manual_edit'
  | 'selected_reference'
  | 'accepted_suggestion';

export type ImportIssue = {
  code: string;
  severity: 'error' | 'warning' | 'conflict';
  field?: string;
  message: string;
};

export type ImportCorrection = {
  field: string;
  originalValue?: string;
  correctedValue?: string;
  selectedEntityKind?: ExcelEntityKind | 'boardingPoint';
  selectedEntityId?: string;
  selectedEntityLabel?: string;
  reason: CorrectionOrigin;
  correctedAt: string;
};

export type PlannedRow = {
  kind: ExcelEntityKind;
  sheet: string;
  rowNumber: number;
  rowKey: string;
  operation: RowOperation;
  validation: RowValidation;
  decision: RowDecision;
  corrected: boolean;
  issues: ImportIssue[];
  originalValues: Record<string, string>;
  effectiveValues: Record<string, string>;
  corrections: ImportCorrection[];
  status: RowStatus;
  field?: string;
  message?: string;
  entityId?: string;
  create?: Record<string, unknown>;
  changes?: Record<string, unknown>;
};

export type SheetHeaderError = {
  sheet: string;
  message: string;
};

export type EntityTotals = {
  rows: number;
  valid: number;
  invalid: number;
  news: number;
  updates: number;
  duplicates: number;
  missingRefs: number;
  errors: number;
  conflicts: number;
  ignored: number;
  corrected: number;
};

export type ImportPlan = {
  sheetsFound: ExcelEntityKind[];
  ignoredSheets: string[];
  headerErrors: SheetHeaderError[];
  fileName?: string;
  fileSize?: number;
  vehicles: PlannedRow[];
  schools: PlannedRow[];
  routes: PlannedRow[];
  students: PlannedRow[];
  totals: Record<ExcelEntityKind, EntityTotals>;
};

export type ReviewOverlay = {
  corrections: Record<string, Record<string, ImportCorrection>>;
  decisions: Record<string, RowDecision>;
};

export function rowKey(kind: ExcelEntityKind, rowNumber: number): string {
  return `${kind}:${rowNumber}`;
}

export function emptyOverlay(): ReviewOverlay {
  return { corrections: {}, decisions: {} };
}

export function isEligibleRow(row: PlannedRow): boolean {
  return (
    row.decision === 'include' &&
    row.validation === 'valid' &&
    (row.operation === 'create' || row.operation === 'update')
  );
}
