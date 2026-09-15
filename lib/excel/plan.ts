import type { Route, School, Student, Vehicle } from '../../types';
import { createBoardingPoint } from '../boardingPoints';

import { SHEET_TITLES, type ExcelEntityKind } from './contract';
import {
  businessCode,
  exactText,
  isValidHhMm,
  parseBoardingPointNames,
  parseOperationType,
  parseOptionalNumber,
  parsePeriod,
  parsePositiveInt,
  validPhone,
  validPlate,
} from './normalize';
import type {
  EntityTotals,
  ImportPlan,
  ImportSnapshot,
  PlannedRow,
  RowStatus,
} from './types';
import { parseWorkbookBuffer, type ParsedSheet } from './workbook';

type IndexedSchool = School & { _pending?: boolean };
type IndexedRoute = Route & { _pending?: boolean };
type IndexedVehicle = Vehicle & { _pending?: boolean };

function emptyTotals(): EntityTotals {
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
  };
}

function tally(rows: PlannedRow[]): EntityTotals {
  const totals = emptyTotals();
  totals.rows = rows.length;
  for (const row of rows) {
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

function fail(
  sheet: string,
  rowNumber: number,
  status: RowStatus,
  message: string,
  field?: string,
): PlannedRow {
  return { sheet, rowNumber, status, message, field };
}

function findSchoolsByRegistry(
  schools: IndexedSchool[],
  registry: string,
): IndexedSchool[] {
  return schools.filter((item) => item.registry === registry);
}

function findSchoolsByName(schools: IndexedSchool[], name: string): IndexedSchool[] {
  return schools.filter((item) => item.name === name);
}

function resolveSchool(
  schools: IndexedSchool[],
  cell: string,
): { school?: IndexedSchool; status?: RowStatus; message?: string } {
  const value = exactText(cell);
  if (!value) {
    return { status: 'missing_ref', message: 'Escola não informada' };
  }
  const byRegistry = findSchoolsByRegistry(schools, value);
  if (byRegistry.length === 1) {
    return { school: byRegistry[0] };
  }
  if (byRegistry.length > 1) {
    return { status: 'conflict', message: 'Registro de escola ambíguo' };
  }
  const byName = findSchoolsByName(schools, value);
  if (byName.length === 1) {
    return { school: byName[0] };
  }
  if (byName.length > 1) {
    return { status: 'conflict', message: 'Nome de escola ambíguo' };
  }
  return { status: 'missing_ref', message: 'Escola não encontrada' };
}

function resolveRoute(
  routes: IndexedRoute[],
  title: string,
  schoolId: string,
): { route?: IndexedRoute; status?: RowStatus; message?: string } {
  const name = exactText(title);
  if (!name) {
    return { status: 'missing_ref', message: 'Rota não informada' };
  }
  const matches = routes.filter(
    (item) => item.title === name && item.schoolId === schoolId,
  );
  if (matches.length === 1) {
    return { route: matches[0] };
  }
  if (matches.length > 1) {
    return { status: 'conflict', message: 'Título de rota ambíguo nesta escola' };
  }
  return { status: 'missing_ref', message: 'Rota não encontrada' };
}

function resolveVehicle(
  vehicles: IndexedVehicle[],
  plateCell: string,
): { vehicle?: IndexedVehicle; status?: RowStatus; message?: string } {
  const plate = validPlate(plateCell);
  if (!plate) {
    return { status: 'error', message: 'Placa inválida' };
  }
  const matches = vehicles.filter((item) => item.plate === plate);
  if (matches.length === 1) {
    return { vehicle: matches[0] };
  }
  if (matches.length > 1) {
    return { status: 'conflict', message: 'Placa ambígua no cadastro' };
  }
  return { status: 'missing_ref', message: 'Veículo não encontrado' };
}

function planVehicles(
  sheet: ParsedSheet | undefined,
  vehicles: IndexedVehicle[],
): { rows: PlannedRow[]; next: IndexedVehicle[] } {
  const title = SHEET_TITLES.vehicles;
  if (!sheet) {
    return { rows: [], next: vehicles };
  }
  const next = [...vehicles];
  const rows: PlannedRow[] = [];
  const plateCounts = new Map<string, number>();
  const parsedPlates: Array<string | undefined> = [];

  for (const row of sheet.rows) {
    const plate = validPlate(row.values.plate ?? '');
    parsedPlates.push(plate);
    if (plate) {
      plateCounts.set(plate, (plateCounts.get(plate) ?? 0) + 1);
    }
  }

  sheet.rows.forEach((row, index) => {
    const plate = parsedPlates[index];
    if (!exactText(row.values.plate)) {
      rows.push(fail(title, row.rowNumber, 'error', 'Placa é obrigatória', 'Placa'));
      return;
    }
    if (!plate) {
      rows.push(fail(title, row.rowNumber, 'error', 'Placa inválida', 'Placa'));
      return;
    }
    if ((plateCounts.get(plate) ?? 0) > 1) {
      rows.push(
        fail(title, row.rowNumber, 'duplicate', 'Placa duplicada no arquivo', 'Placa'),
      );
      return;
    }

    const matches = next.filter((item) => item.plate === plate);
    if (matches.length > 1) {
      rows.push(
        fail(title, row.rowNumber, 'conflict', 'Placa ambígua no cadastro', 'Placa'),
      );
      return;
    }

    const responsible = exactText(row.values.responsible);
    const seatsRaw = exactText(row.values.totalSeats);
    const seats = seatsRaw ? parsePositiveInt(seatsRaw) : null;

    if (matches.length === 0) {
      if (!responsible) {
        rows.push(
          fail(title, row.rowNumber, 'error', 'Responsável é obrigatório', 'Responsável'),
        );
        return;
      }
      if (seats == null) {
        rows.push(
          fail(
            title,
            row.rowNumber,
            'error',
            'Quantidade de assentos inválida',
            'Quantidade de assentos',
          ),
        );
        return;
      }
      const created: IndexedVehicle = {
        id: `pending-vehicle-${plate}`,
        plate,
        responsible,
        totalSeats: seats,
        seatsMap: Array.from({ length: seats }, (_, seatIndex) => ({
          seatNumber: seatIndex + 1,
          studentId: null,
        })),
        _pending: true,
      };
      next.push(created);
      rows.push({
        sheet: title,
        rowNumber: row.rowNumber,
        status: 'new',
        create: {
          plate,
          responsible,
          totalSeats: seats,
        },
      });
      return;
    }

    const existing = matches[0];
    const changes: Record<string, unknown> = {};
    if (responsible) {
      changes.responsible = responsible;
    }
    if (seatsRaw) {
      if (seats == null) {
        rows.push(
          fail(
            title,
            row.rowNumber,
            'error',
            'Quantidade de assentos inválida',
            'Quantidade de assentos',
          ),
        );
        return;
      }
      changes.totalSeats = seats;
    }
    if (typeof changes.responsible === 'string') {
      existing.responsible = changes.responsible;
    }
    if (typeof changes.totalSeats === 'number') {
      existing.totalSeats = changes.totalSeats;
    }
    rows.push({
      sheet: title,
      rowNumber: row.rowNumber,
      status: 'update',
      entityId: existing.id,
      changes,
    });
  });

  return { rows, next };
}

function planSchools(
  sheet: ParsedSheet | undefined,
  schools: IndexedSchool[],
): { rows: PlannedRow[]; next: IndexedSchool[] } {
  const title = SHEET_TITLES.schools;
  if (!sheet) {
    return { rows: [], next: schools };
  }
  const next = [...schools];
  const rows: PlannedRow[] = [];
  const registryCounts = new Map<string, number>();

  for (const row of sheet.rows) {
    const registry = businessCode(row.values.registry);
    if (registry) {
      registryCounts.set(registry, (registryCounts.get(registry) ?? 0) + 1);
    }
  }

  for (const row of sheet.rows) {
    const registry = businessCode(row.values.registry);
    const name = exactText(row.values.name);
    const address = exactText(row.values.address);
    const principal = exactText(row.values.principal);
    const phoneRaw = exactText(row.values.phone);
    let phone: string | undefined;
    if (phoneRaw) {
      phone = validPhone(phoneRaw);
      if (!phone) {
        rows.push(
          fail(title, row.rowNumber, 'error', 'Telefone inválido', 'Telefone'),
        );
        continue;
      }
    }
    const latRaw = exactText(row.values.latitude);
    const lngRaw = exactText(row.values.longitude);
    let latitude: number | undefined;
    let longitude: number | undefined;
    if (latRaw) {
      latitude = parseOptionalNumber(latRaw);
      if (latitude === undefined || Number.isNaN(latitude)) {
        rows.push(fail(title, row.rowNumber, 'error', 'Latitude inválida', 'Latitude'));
        continue;
      }
    }
    if (lngRaw) {
      longitude = parseOptionalNumber(lngRaw);
      if (longitude === undefined || Number.isNaN(longitude)) {
        rows.push(
          fail(title, row.rowNumber, 'error', 'Longitude inválida', 'Longitude'),
        );
        continue;
      }
    }

    if (registry && (registryCounts.get(registry) ?? 0) > 1) {
      rows.push(
        fail(title, row.rowNumber, 'duplicate', 'Registro duplicado no arquivo', 'Registro'),
      );
      continue;
    }

    let matches: IndexedSchool[] = [];
    if (registry) {
      matches = findSchoolsByRegistry(next, registry);
      if (matches.length > 1) {
        rows.push(
          fail(title, row.rowNumber, 'conflict', 'Registro ambíguo no cadastro', 'Registro'),
        );
        continue;
      }
    } else if (name) {
      matches = findSchoolsByName(next, name);
      if (matches.length > 1) {
        rows.push(
          fail(title, row.rowNumber, 'conflict', 'Nome de escola ambíguo', 'Nome'),
        );
        continue;
      }
    }

    if (matches.length === 0) {
      if (!name) {
        rows.push(fail(title, row.rowNumber, 'error', 'Nome é obrigatório', 'Nome'));
        continue;
      }
      const created: IndexedSchool = {
        id: `pending-school-${registry ?? name}`,
        name,
        address,
        principal,
        phone,
        registry,
        studentIds: [],
        routeIds: [],
        latitude,
        longitude,
        _pending: true,
      };
      next.push(created);
      rows.push({
        sheet: title,
        rowNumber: row.rowNumber,
        status: 'new',
        create: {
          name,
          address,
          principal,
          phone,
          registry,
          latitude,
          longitude,
        },
      });
      continue;
    }

    const existing = matches[0];
    const changes: Record<string, unknown> = {};
    if (name) {
      changes.name = name;
      existing.name = name;
    }
    if (address !== undefined && exactText(row.values.address)) {
      changes.address = address;
      existing.address = address;
    }
    if (principal !== undefined && exactText(row.values.principal)) {
      changes.principal = principal;
      existing.principal = principal;
    }
    if (phone) {
      changes.phone = phone;
      existing.phone = phone;
    }
    if (registry) {
      changes.registry = registry;
      existing.registry = registry;
    }
    if (latitude !== undefined) {
      changes.latitude = latitude;
      existing.latitude = latitude;
    }
    if (longitude !== undefined) {
      changes.longitude = longitude;
      existing.longitude = longitude;
    }
    rows.push({
      sheet: title,
      rowNumber: row.rowNumber,
      status: 'update',
      entityId: existing.id,
      changes,
    });
  }

  return { rows, next };
}

function planRoutes(
  sheet: ParsedSheet | undefined,
  routes: IndexedRoute[],
  schools: IndexedSchool[],
): { rows: PlannedRow[]; next: IndexedRoute[] } {
  const title = SHEET_TITLES.routes;
  if (!sheet) {
    return { rows: [], next: routes };
  }
  const next = [...routes];
  const rows: PlannedRow[] = [];
  const keyCounts = new Map<string, number>();
  const resolvedKeys: Array<string | undefined> = [];

  for (const row of sheet.rows) {
    const schoolHit = resolveSchool(schools, row.values.school ?? '');
    const routeTitle = exactText(row.values.title);
    if (schoolHit.school && routeTitle) {
      const key = `${schoolHit.school.id}::${routeTitle}`;
      resolvedKeys.push(key);
      keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
    } else {
      resolvedKeys.push(undefined);
    }
  }

  sheet.rows.forEach((row, index) => {
    const schoolHit = resolveSchool(schools, row.values.school ?? '');
    if (!schoolHit.school) {
      rows.push(
        fail(
          title,
          row.rowNumber,
          schoolHit.status ?? 'missing_ref',
          schoolHit.message ?? 'Escola não encontrada',
          'Escola',
        ),
      );
      return;
    }
    const routeTitle = exactText(row.values.title);
    if (!routeTitle) {
      rows.push(fail(title, row.rowNumber, 'error', 'Título é obrigatório', 'Título'));
      return;
    }
    const fileKey = resolvedKeys[index];
    if (fileKey && (keyCounts.get(fileKey) ?? 0) > 1) {
      rows.push(
        fail(title, row.rowNumber, 'duplicate', 'Rota duplicada no arquivo', 'Título'),
      );
      return;
    }

    const responsible = exactText(row.values.responsible);
    const monitor = exactText(row.values.monitor);
    const startPoint = exactText(row.values.startPoint);
    const departureTimeIda = exactText(row.values.departureTimeIda);
    const arrivalTimeIda = exactText(row.values.arrivalTimeIda);
    const departureTimeVolta = exactText(row.values.departureTimeVolta);
    const arrivalTimeVolta = exactText(row.values.arrivalTimeVolta);
    const periodRaw = exactText(row.values.period);
    const operationRaw = exactText(row.values.operationType);
    const pointsRaw = exactText(row.values.boardingPoints);

    const times = [
      ['Horário início ida', departureTimeIda],
      ['Horário término ida', arrivalTimeIda],
      ['Horário início volta', departureTimeVolta],
      ['Horário término volta', arrivalTimeVolta],
    ] as const;

    const existingHit = resolveRoute(next, routeTitle, schoolHit.school.id);
    if (existingHit.status === 'conflict') {
      rows.push(
        fail(title, row.rowNumber, 'conflict', existingHit.message ?? '', 'Título'),
      );
      return;
    }

    if (!existingHit.route) {
      for (const [field, value] of [
        ['Responsável', responsible],
        ['Monitor', monitor],
        ['Ponto de início', startPoint],
      ] as const) {
        if (!value) {
          rows.push(fail(title, row.rowNumber, 'error', `${field} é obrigatório`, field));
          return;
        }
      }
      for (const [field, value] of times) {
        if (!value || !isValidHhMm(value)) {
          rows.push(fail(title, row.rowNumber, 'error', 'Horário inválido', field));
          return;
        }
      }
      const period = periodRaw ? parsePeriod(periodRaw) : undefined;
      if (!period) {
        rows.push(fail(title, row.rowNumber, 'error', 'Período inválido', 'Período'));
        return;
      }
      const operationType = operationRaw
        ? parseOperationType(operationRaw)
        : undefined;
      if (!operationType) {
        rows.push(
          fail(title, row.rowNumber, 'error', 'Tipo de operação inválido', 'Tipo de operação'),
        );
        return;
      }
      const boardingPoints = parseBoardingPointNames(pointsRaw ?? '').map((name) =>
        createBoardingPoint(name),
      );
      const created: IndexedRoute = {
        id: `pending-route-${schoolHit.school.id}-${routeTitle}`,
        title: routeTitle,
        responsible: responsible!,
        monitor: monitor!,
        startPoint: startPoint!,
        boardingPoints,
        schoolId: schoolHit.school.id,
        departureTimeIda: departureTimeIda!,
        arrivalTimeIda: arrivalTimeIda!,
        departureTimeVolta: departureTimeVolta!,
        arrivalTimeVolta: arrivalTimeVolta!,
        period,
        operationType,
        _pending: true,
      };
      next.push(created);
      rows.push({
        sheet: title,
        rowNumber: row.rowNumber,
        status: 'new',
        create: {
          title: routeTitle,
          responsible,
          monitor,
          startPoint,
          boardingPoints: boardingPoints.map((point) => point.name),
          schoolRef: row.values.school,
          departureTimeIda,
          arrivalTimeIda,
          departureTimeVolta,
          arrivalTimeVolta,
          period,
          operationType,
        },
      });
      return;
    }

    const existing = existingHit.route;
    const changes: Record<string, unknown> = {};
    if (responsible) {
      changes.responsible = responsible;
      existing.responsible = responsible;
    }
    if (monitor) {
      changes.monitor = monitor;
      existing.monitor = monitor;
    }
    if (startPoint) {
      changes.startPoint = startPoint;
      existing.startPoint = startPoint;
    }
    for (const [field, value, prop] of [
      ['Horário início ida', departureTimeIda, 'departureTimeIda'],
      ['Horário término ida', arrivalTimeIda, 'arrivalTimeIda'],
      ['Horário início volta', departureTimeVolta, 'departureTimeVolta'],
      ['Horário término volta', arrivalTimeVolta, 'arrivalTimeVolta'],
    ] as const) {
      if (value) {
        if (!isValidHhMm(value)) {
          rows.push(fail(title, row.rowNumber, 'error', 'Horário inválido', field));
          return;
        }
        changes[prop] = value;
        (existing as unknown as Record<string, string>)[prop] = value;
      }
    }
    if (periodRaw) {
      const period = parsePeriod(periodRaw);
      if (!period) {
        rows.push(fail(title, row.rowNumber, 'error', 'Período inválido', 'Período'));
        return;
      }
      changes.period = period;
      existing.period = period;
    }
    if (operationRaw) {
      const operationType = parseOperationType(operationRaw);
      if (!operationType) {
        rows.push(
          fail(title, row.rowNumber, 'error', 'Tipo de operação inválido', 'Tipo de operação'),
        );
        return;
      }
      changes.operationType = operationType;
      existing.operationType = operationType;
    }
    if (pointsRaw) {
      const names = parseBoardingPointNames(pointsRaw);
      changes.boardingPoints = names;
      existing.boardingPoints = names.map((name) => createBoardingPoint(name));
    }
    changes.schoolRef = row.values.school;
    rows.push({
      sheet: title,
      rowNumber: row.rowNumber,
      status: 'update',
      entityId: existing.id,
      changes,
    });
  });

  return { rows, next };
}

function seatTaken(
  vehicle: IndexedVehicle,
  seatNumber: number,
  selfStudentId?: string,
): boolean {
  const seat = vehicle.seatsMap.find((item) => item.seatNumber === seatNumber);
  if (!seat?.studentId) {
    return false;
  }
  return seat.studentId !== selfStudentId;
}

function occupySeat(
  vehicle: IndexedVehicle,
  seatNumber: number,
  studentId: string,
  previous?: { vehicleId: string; seatNumber: number },
  vehicles?: IndexedVehicle[],
) {
  if (previous && vehicles) {
    const oldVehicle = vehicles.find((item) => item.id === previous.vehicleId);
    if (oldVehicle) {
      oldVehicle.seatsMap = oldVehicle.seatsMap.map((item) =>
        item.seatNumber === previous.seatNumber ? { ...item, studentId: null } : item,
      );
    }
  }
  let found = false;
  vehicle.seatsMap = vehicle.seatsMap.map((item) => {
    if (item.seatNumber !== seatNumber) {
      return item;
    }
    found = true;
    return { ...item, studentId };
  });
  if (!found) {
    vehicle.seatsMap = [...vehicle.seatsMap, { seatNumber, studentId }];
  }
}

function planStudents(
  sheet: ParsedSheet | undefined,
  snapshot: ImportSnapshot,
  schools: IndexedSchool[],
  routes: IndexedRoute[],
  vehicles: IndexedVehicle[],
): PlannedRow[] {
  const title = SHEET_TITLES.students;
  if (!sheet) {
    return [];
  }
  const students = snapshot.students.map((item) => ({ ...item }));
  const rows: PlannedRow[] = [];
  const codeCounts = new Map<string, number>();

  for (const row of sheet.rows) {
    const code = businessCode(row.values.enrollmentCode);
    if (code) {
      codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1);
    }
  }

  for (const row of sheet.rows) {
    const code = businessCode(row.values.enrollmentCode);
    if (code && (codeCounts.get(code) ?? 0) > 1) {
      rows.push(
        fail(
          title,
          row.rowNumber,
          'duplicate',
          'Carteirinha duplicada no arquivo',
          'Carteirinha / Matrícula',
        ),
      );
      continue;
    }

    let existing: Student | undefined;
    if (code) {
      const matches = students.filter((item) => item.enrollmentCode === code);
      if (matches.length > 1) {
        rows.push(
          fail(
            title,
            row.rowNumber,
            'conflict',
            'Carteirinha ambígua no cadastro',
            'Carteirinha / Matrícula',
          ),
        );
        continue;
      }
      existing = matches[0];
    }

    const name = exactText(row.values.name);
    const ageRaw = exactText(row.values.age);
    let age: number | undefined;
    if (ageRaw) {
      const parsed = parsePositiveInt(ageRaw);
      if (parsed == null) {
        rows.push(fail(title, row.rowNumber, 'error', 'Idade inválida', 'Idade'));
        continue;
      }
      age = parsed;
    }
    const responsible = exactText(row.values.responsible);
    const phones: string[] = [];
    let phoneError = false;
    for (const [field, raw] of [
      ['Telefone 1', exactText(row.values.phone1)],
      ['Telefone 2', exactText(row.values.phone2)],
    ] as const) {
      if (!raw) {
        continue;
      }
      const phone = validPhone(raw);
      if (!phone) {
        rows.push(fail(title, row.rowNumber, 'error', 'Telefone inválido', field));
        phoneError = true;
        break;
      }
      phones.push(phone);
    }
    if (phoneError) {
      continue;
    }
    const grade = exactText(row.values.grade);

    const schoolHit = resolveSchool(schools, row.values.school ?? '');
    if (!schoolHit.school) {
      rows.push(
        fail(
          title,
          row.rowNumber,
          schoolHit.status ?? 'missing_ref',
          schoolHit.message ?? 'Escola não encontrada',
          'Escola',
        ),
      );
      continue;
    }
    const routeTitle = exactText(row.values.route);
    const routeHit = resolveRoute(routes, routeTitle ?? '', schoolHit.school.id);
    if (!routeHit.route) {
      rows.push(
        fail(
          title,
          row.rowNumber,
          routeHit.status ?? 'missing_ref',
          routeHit.message ?? 'Rota não encontrada',
          'Rota',
        ),
      );
      continue;
    }
    const point = exactText(row.values.boardingPoint);
    if (!point) {
      rows.push(
        fail(title, row.rowNumber, 'error', 'Ponto de embarque é obrigatório', 'Ponto de embarque'),
      );
      continue;
    }
    const pointExists = routeHit.route.boardingPoints.some((item) => item.name === point);
    if (!pointExists) {
      rows.push(
        fail(
          title,
          row.rowNumber,
          'missing_ref',
          'Ponto de embarque não encontrado na rota',
          'Ponto de embarque',
        ),
      );
      continue;
    }
    const vehicleHit = resolveVehicle(vehicles, row.values.vehicle ?? '');
    if (!vehicleHit.vehicle) {
      rows.push(
        fail(
          title,
          row.rowNumber,
          vehicleHit.status ?? 'missing_ref',
          vehicleHit.message ?? 'Veículo não encontrado',
          'Veículo',
        ),
      );
      continue;
    }
    const seatRaw = exactText(row.values.seatNumber);
    const seatNumber = seatRaw ? parsePositiveInt(seatRaw) : null;
    if (seatNumber == null) {
      rows.push(fail(title, row.rowNumber, 'error', 'Assento inválido', 'Assento'));
      continue;
    }
    if (seatNumber > vehicleHit.vehicle.totalSeats) {
      rows.push(
        fail(title, row.rowNumber, 'error', 'Assento fora da quantidade do veículo', 'Assento'),
      );
      continue;
    }
    if (seatTaken(vehicleHit.vehicle, seatNumber, existing?.id)) {
      rows.push(fail(title, row.rowNumber, 'error', 'Assento ocupado', 'Assento'));
      continue;
    }

    if (!existing) {
      if (!name) {
        rows.push(fail(title, row.rowNumber, 'error', 'Nome é obrigatório', 'Nome'));
        continue;
      }
      const pendingId = `pending-student-${code ?? `${name}-${row.rowNumber}`}`;
      occupySeat(vehicleHit.vehicle, seatNumber, pendingId);
      rows.push({
        sheet: title,
        rowNumber: row.rowNumber,
        status: 'new',
        create: {
          name,
          age,
          responsible,
          contactPhones: phones,
          grade,
          enrollmentCode: code,
          boardingPoint: point,
          seatNumber,
          schoolRef: row.values.school,
          routeTitle,
          vehiclePlate: vehicleHit.vehicle.plate,
        },
      });
      continue;
    }

    const changes: Record<string, unknown> = {
      schoolRef: row.values.school,
      routeTitle,
      vehiclePlate: vehicleHit.vehicle.plate,
      boardingPoint: point,
      seatNumber,
    };
    if (name) {
      changes.name = name;
    }
    if (age !== undefined) {
      changes.age = age;
    }
    if (responsible) {
      changes.responsible = responsible;
    }
    if (exactText(row.values.phone1) || exactText(row.values.phone2)) {
      changes.contactPhones = phones;
    }
    if (grade) {
      changes.grade = grade;
    }
    occupySeat(vehicleHit.vehicle, seatNumber, existing.id, {
      vehicleId: existing.vehicleId,
      seatNumber: existing.seatNumber,
    }, vehicles);
    existing.schoolId = schoolHit.school.id;
    existing.routeId = routeHit.route.id;
    existing.vehicleId = vehicleHit.vehicle.id;
    existing.seatNumber = seatNumber;
    rows.push({
      sheet: title,
      rowNumber: row.rowNumber,
      status: 'update',
      entityId: existing.id,
      changes,
    });
  }

  return rows;
}

export function buildImportPlan(
  snapshot: ImportSnapshot,
  buffer: ArrayBuffer | Uint8Array,
): ImportPlan {
  const parsed = parseWorkbookBuffer(buffer);
  const sheetsFound = (Object.keys(parsed.sheets) as ExcelEntityKind[]).filter(
    (kind) => parsed.sheets[kind],
  );

  const vehiclePlan = planVehicles(
    parsed.sheets.vehicles,
    snapshot.vehicles.map((item) => ({
      ...item,
      seatsMap: item.seatsMap.map((seat) => ({ ...seat })),
    })),
  );
  const schoolPlan = planSchools(
    parsed.sheets.schools,
    snapshot.schools.map((item) => ({ ...item })),
  );
  const routePlan = planRoutes(
    parsed.sheets.routes,
    snapshot.routes.map((item) => ({
      ...item,
      boardingPoints: item.boardingPoints.map((point) => ({ ...point })),
    })),
    schoolPlan.next,
  );
  const studentRows = planStudents(
    parsed.sheets.students,
    snapshot,
    schoolPlan.next,
    routePlan.next,
    vehiclePlan.next,
  );

  return {
    sheetsFound,
    ignoredSheets: parsed.ignoredSheets,
    headerErrors: parsed.headerErrors,
    vehicles: vehiclePlan.rows,
    schools: schoolPlan.rows,
    routes: routePlan.rows,
    students: studentRows,
    totals: {
      vehicles: tally(vehiclePlan.rows),
      schools: tally(schoolPlan.rows),
      routes: tally(routePlan.rows),
      students: tally(studentRows),
    },
  };
}
