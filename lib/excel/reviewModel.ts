import type { ExcelEntityKind } from './contract';
import { COLUMNS_BY_KIND, SHEET_TITLES } from './contract';
import { parseBoardingPointNames } from './normalize';
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
  source: 'persisted' | 'planned';
  matchValue?: string;
};

function includedRows(rows: PlannedRow[]): PlannedRow[] {
  return rows.filter((row) => row.decision === 'include');
}

function mergeOptions(persisted: RefOption[], planned: RefOption[]): RefOption[] {
  const seen = new Set(persisted.map((item) => item.label));
  return [
    ...persisted,
    ...planned.filter((item) => {
      if (seen.has(item.label)) {
        return false;
      }
      seen.add(item.label);
      return true;
    }),
  ];
}

function schoolCellMatches(
  cell: string,
  school: { id?: string; name?: string; registry?: string },
): boolean {
  const value = cell.trim();
  if (!value) {
    return false;
  }
  return value === school.name || value === school.registry || value === school.id;
}

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

export function schoolOptions(snapshot: ImportSnapshot, plan?: ImportPlan): RefOption[] {
  const persisted = snapshot.schools.map((item) => ({
    id: item.id,
    label: item.name,
    detail: item.registry,
    kind: 'schools' as const,
    source: 'persisted' as const,
    matchValue: item.registry?.trim() || item.name,
  }));
  const planned = includedRows(plan?.schools ?? []).map((row) => {
    const name = row.effectiveValues.name || rowTitle(row);
    const registry = row.effectiveValues.registry;
    return {
      id: `planned:${row.rowKey}`,
      label: name,
      detail: [registry, 'Neste arquivo'].filter(Boolean).join(' · '),
      kind: 'schools' as const,
      source: 'planned' as const,
      matchValue: registry?.trim() || name,
    };
  });
  return mergeOptions(persisted, planned);
}

export function routeOptions(
  snapshot: ImportSnapshot,
  schoolId?: string,
  plan?: ImportPlan,
  schoolLabel?: string,
): RefOption[] {
  const school = snapshot.schools.find((item) => item.id === schoolId);
  const persisted = snapshot.routes
    .filter((item) => {
      if (!schoolId || schoolId.startsWith('planned:')) {
        return !schoolId;
      }
      return item.schoolId === schoolId;
    })
    .map((item) => ({
      id: item.id,
      label: item.title,
      detail: snapshot.schools.find((entry) => entry.id === item.schoolId)?.name,
      kind: 'routes' as const,
      source: 'persisted' as const,
      matchValue: item.title,
    }));
  const planned = includedRows(plan?.routes ?? [])
    .filter((row) => {
      const cell = row.effectiveValues.school ?? '';
      if (schoolLabel) {
        return (
          schoolCellMatches(cell, { name: schoolLabel, registry: schoolLabel }) ||
          (school ? schoolCellMatches(cell, school) : false)
        );
      }
      if (school) {
        return schoolCellMatches(cell, school);
      }
      return !schoolId;
    })
    .map((row) => ({
      id: `planned:${row.rowKey}`,
      label: row.effectiveValues.title || rowTitle(row),
      detail: 'Neste arquivo',
      kind: 'routes' as const,
      source: 'planned' as const,
      matchValue: row.effectiveValues.title || rowTitle(row),
    }));
  return mergeOptions(persisted, planned);
}

export function vehicleOptions(snapshot: ImportSnapshot, plan?: ImportPlan): RefOption[] {
  const persisted = snapshot.vehicles.map((item) => ({
    id: item.id,
    label: item.plate,
    detail: item.responsible,
    kind: 'vehicles' as const,
    source: 'persisted' as const,
    matchValue: item.plate,
  }));
  const planned = includedRows(plan?.vehicles ?? []).map((row) => ({
    id: `planned:${row.rowKey}`,
    label: row.effectiveValues.plate || rowTitle(row),
    detail: 'Neste arquivo',
    kind: 'vehicles' as const,
    source: 'planned' as const,
    matchValue: row.effectiveValues.plate || rowTitle(row),
  }));
  return mergeOptions(persisted, planned);
}

export function boardingPointOptions(
  snapshot: ImportSnapshot,
  routeId?: string,
  plan?: ImportPlan,
  routeLabel?: string,
): RefOption[] {
  const persistedRoute = snapshot.routes.find((item) => item.id === routeId);
  const persisted = (persistedRoute?.boardingPoints ?? []).map((point) => ({
    id: point.id,
    label: point.name,
    kind: 'boardingPoint' as const,
    source: 'persisted' as const,
    matchValue: point.name,
  }));
  const planned = includedRows(plan?.routes ?? [])
    .filter((row) => {
      const title = row.effectiveValues.title || rowTitle(row);
      if (routeLabel) {
        return title === routeLabel;
      }
      if (persistedRoute) {
        return title === persistedRoute.title;
      }
      return !routeId;
    })
    .flatMap((row) =>
      parseBoardingPointNames(row.effectiveValues.boardingPoints ?? '').map((name) => ({
        id: `planned:${row.rowKey}:${name}`,
        label: name,
        detail: 'Neste arquivo',
        kind: 'boardingPoint' as const,
        source: 'planned' as const,
        matchValue: name,
      })),
    );
  return mergeOptions(persisted, planned);
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
