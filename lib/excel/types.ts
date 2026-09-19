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

export type PlannedRow = {
  sheet: string;
  rowNumber: number;
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
};

export type ImportPlan = {
  sheetsFound: ExcelEntityKind[];
  ignoredSheets: string[];
  headerErrors: SheetHeaderError[];
  vehicles: PlannedRow[];
  schools: PlannedRow[];
  routes: PlannedRow[];
  students: PlannedRow[];
  totals: Record<ExcelEntityKind, EntityTotals>;
};
