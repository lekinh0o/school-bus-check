import type { ExcelEntityKind } from './contract';
import { COLUMNS_BY_KIND, SHEET_TITLES } from './contract';
import { allPlanRows } from './overlay';
import type { ImportPlan, ImportSnapshot, PlannedRow, RowOperation, RowValidation } from './types';
import { isEligibleRow } from './types';

export type ReviewFilter = 'problems' | 'eligible' | 'ignored' | 'all';

export const OPERATION_LABEL: Record<RowOperation, string> = {
  create: 'Novo',
  update: 'Atualização',
  none: 'Sem operação',
};

export const VALIDATION_LABEL: Record<RowValidation, string> = {
  valid: 'Apto',
  warning: 'Atenção',
  error: 'Erro',
  conflict: 'Conflito',
};

export const FILTER_LABEL: Record<ReviewFilter, string> = {
  problems: 'Com problemas',
  eligible: 'Aptos',
  ignored: 'Ignorados',
  all: 'Todos',
};

export type RefOption = {
  id: string;
  label: string;
  detail?: string;
  kind: ExcelEntityKind | 'boardingPoint';
};

export function entityLabel(kind: ExcelEntityKind): string {
  return SHEET_TITLES[kind];
}

export function rowTitle(row: PlannedRow): string {
  return (
    row.effectiveValues.name ||
    row.effectiveValues.plate ||
    row.effectiveValues.title ||
    row.effectiveValues.enrollmentCode ||
    `Linha ${row.rowNumber}`
  );
}

export function rowSearchText(row: PlannedRow): string {
  return [
    entityLabel(row.kind),
    String(row.rowNumber),
    rowTitle(row),
    row.message ?? '',
    ...Object.values(row.effectiveValues),
    ...row.issues.map((issue) => issue.message),
  ]
    .join(' ')
    .toLowerCase();
}

export function matchesFilter(row: PlannedRow, filter: ReviewFilter): boolean {
  if (filter === 'problems') {
    return (
      row.decision === 'include' &&
      (row.validation === 'error' ||
        row.validation === 'conflict' ||
        row.validation === 'warning')
    );
  }
  if (filter === 'eligible') {
    return isEligibleRow(row);
  }
  if (filter === 'ignored') {
    return row.decision === 'ignore';
  }
  return true;
}

export function filterPlanRows(
  plan: ImportPlan,
  filter: ReviewFilter,
  query: string,
): PlannedRow[] {
  const needle = query.trim().toLowerCase();
  return allPlanRows(plan).filter((row) => {
    if (!matchesFilter(row, filter)) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return rowSearchText(row).includes(needle);
  });
}

export function findRow(plan: ImportPlan, rowKeyValue: string): PlannedRow | undefined {
  return allPlanRows(plan).find((row) => row.rowKey === rowKeyValue);
}

export function nextProblemRow(
  plan: ImportPlan,
  currentKey?: string,
): PlannedRow | undefined {
  const problems = allPlanRows(plan).filter((row) => matchesFilter(row, 'problems'));
  if (problems.length === 0) {
    return undefined;
  }
  const index = problems.findIndex((row) => row.rowKey === currentKey);
  return problems[(index + 1) % problems.length];
}

export function analysisTotals(plan: ImportPlan) {
  const rows = allPlanRows(plan);
  return {
    eligible: rows.filter(isEligibleRow).length,
    news: rows.filter((row) => row.operation === 'create' && row.decision === 'include').length,
    updates: rows.filter((row) => row.operation === 'update' && row.decision === 'include').length,
    problems: rows.filter((row) => matchesFilter(row, 'problems')).length,
    ignored: rows.filter((row) => row.decision === 'ignore').length,
    sheets: plan.sheetsFound.map((kind) => SHEET_TITLES[kind]),
  };
}

export function editableColumns(kind: ExcelEntityKind) {
  return COLUMNS_BY_KIND[kind];
}

export function schoolOptions(snapshot: ImportSnapshot): RefOption[] {
  return snapshot.schools.map((item) => ({
    id: item.id,
    label: item.name,
    detail: item.registry,
    kind: 'schools',
  }));
}

export function routeOptions(snapshot: ImportSnapshot, schoolId?: string): RefOption[] {
  return snapshot.routes
    .filter((item) => !schoolId || item.schoolId === schoolId)
    .map((item) => ({
      id: item.id,
      label: item.title,
      detail: snapshot.schools.find((school) => school.id === item.schoolId)?.name,
      kind: 'routes',
    }));
}

export function vehicleOptions(snapshot: ImportSnapshot): RefOption[] {
  return snapshot.vehicles.map((item) => ({
    id: item.id,
    label: item.plate,
    detail: item.responsible,
    kind: 'vehicles',
  }));
}

export function boardingPointOptions(
  snapshot: ImportSnapshot,
  routeId?: string,
): RefOption[] {
  const route = snapshot.routes.find((item) => item.id === routeId);
  return (route?.boardingPoints ?? []).map((point) => ({
    id: point.id,
    label: point.name,
    kind: 'boardingPoint',
  }));
}

export function effectiveSchoolId(row: PlannedRow): string | undefined {
  const payload = row.create ?? row.changes;
  const resolved = payload?.resolvedSchoolId;
  return typeof resolved === 'string' ? resolved : undefined;
}

export function effectiveRouteId(row: PlannedRow): string | undefined {
  const payload = row.create ?? row.changes;
  const resolved = payload?.resolvedRouteId;
  return typeof resolved === 'string' ? resolved : undefined;
}
