import * as XLSX from 'xlsx';

import type { Route, School, Student, Vehicle } from '../../types';

import {
  COLUMNS_BY_KIND,
  SHEET_TITLES,
  columnKeyForHeader,
  matchSheetKind,
  requiredColumnKeys,
  type ExcelEntityKind,
} from './contract';
import {
  cellToString,
  formatBoardingPointNames,
  formatOperationType,
  formatPeriod,
} from './normalize';
import { rowKey } from './types';
import type { ImportSnapshot } from './types';

export type ParsedSheet = {
  kind: ExcelEntityKind;
  sheetName: string;
  rows: Array<{ rowNumber: number; values: Record<string, string> }>;
};

export type ParsedWorkbook = {
  sheets: Partial<Record<ExcelEntityKind, ParsedSheet>>;
  ignoredSheets: string[];
  headerErrors: Array<{ sheet: string; message: string }>;
};

export function sourceRowKey(kind: ExcelEntityKind, rowNumber: number): string {
  return rowKey(kind, rowNumber);
}

function headerMap(
  headers: string[],
  kind: ExcelEntityKind,
): Map<number, string> | { error: string } {
  const columns = COLUMNS_BY_KIND[kind];
  const mapped = new Map<number, string>();
  const seen = new Set<string>();
  headers.forEach((header, index) => {
    if (!cellToString(header).trim()) {
      return;
    }
    const key = columnKeyForHeader(header, columns);
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    mapped.set(index, key);
  });
  const missing = requiredColumnKeys(columns).filter((key) => !seen.has(key));
  if (missing.length > 0) {
    const labels = columns
      .filter((column) => missing.includes(column.key))
      .map((column) => column.label);
    return {
      error: `Cabeçalho inválido: faltam ${labels.join(', ')}`,
    };
  }
  return mapped;
}

function workbookBytes(buffer: ArrayBuffer | Uint8Array): Uint8Array {
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

function looksLikeSpreadsheet(bytes: Uint8Array): boolean {
  if (
    bytes.length >= 4 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  ) {
    return true;
  }
  return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

export function parseWorkbookBuffer(buffer: ArrayBuffer | Uint8Array): ParsedWorkbook {
  const bytes = workbookBytes(buffer);
  if (!looksLikeSpreadsheet(bytes)) {
    throw new Error('Arquivo Excel ilegível');
  }
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(bytes, { type: 'array', raw: false });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Arquivo Excel ilegível');
  }
  const ignoredSheets: string[] = [];
  const headerErrors: ParsedWorkbook['headerErrors'] = [];
  const sheets: ParsedWorkbook['sheets'] = {};

  for (const sheetName of workbook.SheetNames) {
    const kind = matchSheetKind(sheetName);
    if (!kind) {
      ignoredSheets.push(sheetName);
      continue;
    }
    const worksheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
      worksheet,
      { header: 1, raw: false, defval: '' },
    );
    if (matrix.length === 0) {
      headerErrors.push({
        sheet: SHEET_TITLES[kind],
        message: 'Cabeçalho inválido: planilha vazia',
      });
      continue;
    }
    const headers = matrix[0].map((cell) => cellToString(cell));
    const mapped = headerMap(headers, kind);
    if ('error' in mapped) {
      headerErrors.push({ sheet: SHEET_TITLES[kind], message: mapped.error });
      continue;
    }
    const rows: ParsedSheet['rows'] = [];
    for (let i = 1; i < matrix.length; i += 1) {
      const line = matrix[i] ?? [];
      const values: Record<string, string> = {};
      let any = false;
      mapped.forEach((key, index) => {
        const text = cellToString(line[index]);
        values[key] = text;
        if (text.trim()) {
          any = true;
        }
      });
      if (!any) {
        continue;
      }
      rows.push({ rowNumber: i + 1, values });
    }
    sheets[kind] = { kind, sheetName, rows };
  }

  return { sheets, ignoredSheets, headerErrors };
}

function schoolLabel(school: School | undefined, schoolId: string): string {
  if (!school) {
    return schoolId;
  }
  return school.registry?.trim() || school.name;
}

export function snapshotToAoa(
  snapshot: ImportSnapshot,
  kinds: ExcelEntityKind[],
): Record<string, string[][]> {
  const schoolById = new Map(snapshot.schools.map((item) => [item.id, item]));
  const routeById = new Map(snapshot.routes.map((item) => [item.id, item]));
  const vehicleById = new Map(snapshot.vehicles.map((item) => [item.id, item]));
  const tables: Record<string, string[][]> = {};

  if (kinds.includes('vehicles')) {
    const columns = COLUMNS_BY_KIND.vehicles;
    tables[SHEET_TITLES.vehicles] = [
      columns.map((column) => column.label),
      ...snapshot.vehicles.map((vehicle: Vehicle) => [
        vehicle.plate,
        vehicle.responsible,
        String(vehicle.totalSeats),
      ]),
    ];
  }

  if (kinds.includes('schools')) {
    const columns = COLUMNS_BY_KIND.schools;
    tables[SHEET_TITLES.schools] = [
      columns.map((column) => column.label),
      ...snapshot.schools.map((school: School) => [
        school.registry ?? '',
        school.name,
        school.address ?? '',
        school.principal ?? '',
        school.phone ?? '',
        school.latitude != null ? String(school.latitude) : '',
        school.longitude != null ? String(school.longitude) : '',
      ]),
    ];
  }

  if (kinds.includes('routes')) {
    const columns = COLUMNS_BY_KIND.routes;
    tables[SHEET_TITLES.routes] = [
      columns.map((column) => column.label),
      ...snapshot.routes.map((route: Route) => [
        route.title,
        schoolLabel(schoolById.get(route.schoolId), route.schoolId),
        route.responsible,
        route.monitor,
        route.startPoint,
        route.departureTimeIda,
        route.arrivalTimeIda,
        route.departureTimeVolta,
        route.arrivalTimeVolta,
        formatPeriod(route.period),
        formatOperationType(route.operationType ?? 'IDA_E_VOLTA'),
        formatBoardingPointNames(route.boardingPoints.map((point) => point.name)),
      ]),
    ];
  }

  if (kinds.includes('students')) {
    const columns = COLUMNS_BY_KIND.students;
    tables[SHEET_TITLES.students] = [
      columns.map((column) => column.label),
      ...snapshot.students.map((student: Student) => {
        const phones = student.contactPhones ?? [];
        return [
          student.enrollmentCode ?? '',
          student.name,
          student.age != null ? String(student.age) : '',
          student.responsible ?? '',
          phones[0] ?? '',
          phones[1] ?? '',
          student.grade ?? '',
          schoolLabel(schoolById.get(student.schoolId), student.schoolId),
          routeById.get(student.routeId)?.title ?? student.routeId,
          student.boardingPoint,
          vehicleById.get(student.vehicleId)?.plate ?? student.vehicleId,
          String(student.seatNumber),
        ];
      }),
    ];
  }

  return tables;
}

function toArrayBuffer(output: ArrayBuffer | Uint8Array | number[]): ArrayBuffer {
  const bytes =
    output instanceof ArrayBuffer
      ? new Uint8Array(output)
      : output instanceof Uint8Array
        ? output
        : Uint8Array.from(output);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export function writeWorkbookBuffer(
  snapshot: ImportSnapshot,
  kinds: ExcelEntityKind[],
): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const tables = snapshotToAoa(snapshot, kinds);
  for (const [title, aoa] of Object.entries(tables)) {
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(workbook, sheet, title);
  }
  const output = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
    cellDates: false,
  });
  return toArrayBuffer(output as ArrayBuffer | Uint8Array | number[]);
}
