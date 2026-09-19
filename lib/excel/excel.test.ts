import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import * as XLSX from 'xlsx';

import { applyImportPlan } from './apply';
import { foldHeader, matchSheetKind } from './contract';
import { parseBoardingPointNames, businessCode } from './normalize';
import { buildImportPlan } from './plan';
import type { ImportSnapshot } from './types';
import { parseWorkbookBuffer, writeWorkbookBuffer } from './workbook';
import { createSession, removeRowCorrection, saveRowCorrections, setRowDecision } from './session';
import { boardingPointOptions, routeOptions, vehicleOptions } from './reviewModel';
import routeReducer, { addRoute } from '../../store/routeSlice';
import schoolReducer, { addSchool, selectAllSchools } from '../../store/schoolSlice';
import studentReducer, { addStudent, selectAllStudents } from '../../store/studentSlice';
import vehicleReducer, {
  addVehicle,
  selectAllVehicles,
} from '../../store/vehicleSlice';
import { createBoardingPoint } from '../boardingPoints';
import type { Route, School, Student, Vehicle } from '../../types';

function bufferFromTables(tables: Record<string, string[][]>): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  for (const [name, aoa] of Object.entries(tables)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(aoa), name);
  }
  const output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  if (output instanceof ArrayBuffer) {
    return output;
  }
  const bytes = Uint8Array.from(output as Uint8Array | number[]);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

const vehicle: Vehicle = {
  id: 'v1',
  plate: 'ABC1D23',
  responsible: 'João',
  totalSeats: 10,
  seatsMap: Array.from({ length: 10 }, (_, index) => ({
    seatNumber: index + 1,
    studentId: null,
  })),
};

const school: School = {
  id: 's1',
  name: 'Escola Municipal Alair Ferreira de Souza',
  registry: 'ESC-01',
  studentIds: [],
  routeIds: ['r1'],
};

const route: Route = {
  id: 'r1',
  title: 'Linha Centro',
  responsible: 'Ana',
  monitor: 'Bia',
  startPoint: 'Praça',
  boardingPoints: [createBoardingPoint('Porta')],
  schoolId: 's1',
  departureTimeIda: '06:00',
  arrivalTimeIda: '07:00',
  departureTimeVolta: '11:00',
  arrivalTimeVolta: '12:00',
  period: 'Manha',
  operationType: 'IDA_E_VOLTA',
};

const filled: ImportSnapshot = {
  vehicles: [vehicle],
  schools: [school],
  routes: [route],
  students: [],
};

function testStore(snapshot: ImportSnapshot) {
  const store = configureStore({
    reducer: combineReducers({
      vehicles: vehicleReducer,
      schools: schoolReducer,
      routes: routeReducer,
      students: studentReducer,
    }),
  });
  for (const item of snapshot.vehicles) {
    store.dispatch(addVehicle(item));
  }
  for (const item of snapshot.schools) {
    store.dispatch(addSchool(item));
  }
  for (const item of snapshot.routes) {
    store.dispatch(addRoute(item));
  }
  for (const item of snapshot.students) {
    store.dispatch(addStudent(item));
  }
  return store;
}

describe('contract', () => {
  it('matches sheet names case-insensitively and ignores unknown tabs', () => {
    assert.equal(matchSheetKind('alunos'), 'students');
    assert.equal(matchSheetKind('Alunos'), 'students');
    assert.equal(matchSheetKind('Notas'), undefined);
    assert.equal(foldHeader('Responsável'), foldHeader('responsavel'));
  });
});

describe('normalize', () => {
  it('keeps leading zeros on enrollment codes', () => {
    assert.equal(businessCode('0123'), '0123');
    assert.equal(businessCode(' 0123 '), '0123');
  });

  it('splits boarding points on pipe or semicolon', () => {
    assert.deepEqual(parseBoardingPointNames('Porta | Praça'), ['Porta', 'Praça']);
    assert.deepEqual(parseBoardingPointNames('Porta; Praça'), ['Porta', 'Praça']);
  });
});

describe('workbook round-trip', () => {
  it('writes the four sheets and reimports the same headers and values', () => {
    const student: Student = {
      id: 'st1',
      name: 'Lia',
      schoolId: 's1',
      routeId: 'r1',
      boardingPoint: 'Porta',
      vehicleId: 'v1',
      seatNumber: 1,
      enrollmentCode: '0123',
    };
    const snapshot: ImportSnapshot = {
      ...filled,
      students: [student],
    };
    const buffer = writeWorkbookBuffer(snapshot, [
      'vehicles',
      'schools',
      'routes',
      'students',
    ]);
    const parsed = parseWorkbookBuffer(buffer);
    assert.deepEqual(Object.keys(parsed.sheets).sort(), [
      'routes',
      'schools',
      'students',
      'vehicles',
    ]);
    assert.equal(parsed.sheets.students?.rows[0]?.values.enrollmentCode, '0123');
    assert.equal(parsed.sheets.vehicles?.rows[0]?.values.plate, 'ABC1D23');
  });
});

describe('buildImportPlan', () => {
  it('imports a single students sheet without requiring others', () => {
    const buffer = bufferFromTables({
      Alunos: [
        [
          'Carteirinha / Matrícula',
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['0123', 'Lia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
      ],
    });
    const plan = buildImportPlan(filled, buffer);
    assert.deepEqual(plan.sheetsFound, ['students']);
    assert.equal(plan.students[0]?.status, 'new');
    assert.equal(plan.vehicles.length, 0);
    assert.equal(plan.schools.length, 0);
    assert.equal(plan.routes.length, 0);
  });

  it('accepts multiple sheets in any order and ignores missing tabs', () => {
    const buffer = bufferFromTables({
      Veículos: [
        ['Placa', 'Responsável', 'Quantidade de assentos'],
        ['XYZ1A23', 'Carlos', '8'],
      ],
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Lia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '2'],
      ],
      Escolas: [
        ['Nome', 'Registro'],
        ['Nova Escola', 'ESC-02'],
      ],
    });
    const plan = buildImportPlan(filled, buffer);
    assert.ok(plan.sheetsFound.includes('vehicles'));
    assert.ok(plan.sheetsFound.includes('students'));
    assert.ok(plan.sheetsFound.includes('schools'));
    assert.equal(plan.headerErrors.length, 0);
    assert.equal(plan.vehicles[0]?.status, 'new');
    assert.equal(plan.schools[0]?.status, 'new');
  });

  it('ignores extra sheets and reports invalid student headers', () => {
    const ok = bufferFromTables({
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Lia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
      ],
      Notas: [['x'], ['1']],
    });
    const plan = buildImportPlan(filled, ok);
    assert.deepEqual(plan.ignoredSheets, ['Notas']);

    const bad = bufferFromTables({
      Alunos: [['Foo'], ['bar']],
    });
    const badPlan = buildImportPlan(filled, bad);
    assert.equal(badPlan.headerErrors[0]?.sheet, 'Alunos');
    assert.equal(badPlan.students.length, 0);
  });

  it('classifies new, existing, duplicate, missing ref and accent-exact names', () => {
    const snapshot: ImportSnapshot = {
      ...filled,
      students: [
        {
          id: 'st1',
          name: 'Lia',
          schoolId: 's1',
          routeId: 'r1',
          boardingPoint: 'Porta',
          vehicleId: 'v1',
          seatNumber: 1,
          enrollmentCode: '0123',
        },
      ],
    };
    snapshot.vehicles[0].seatsMap[0] = { seatNumber: 1, studentId: 'st1' };

    const buffer = bufferFromTables({
      Alunos: [
        [
          'Carteirinha / Matrícula',
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['0123', 'Lia Atualizada', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
        ['0123', 'Outra', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '2'],
        ['9999', 'Nova', 'Inexistente', 'Linha Centro', 'Porta', 'ABC1D23', '2'],
        ['', 'Sem Código', 'Escola Municipal Alair Ferreira de Souza', 'Linha Centro', 'Porta', 'ABC1D23', '3'],
      ],
    });
    const plan = buildImportPlan(snapshot, buffer);
    assert.equal(plan.students[0]?.status, 'duplicate');
    assert.equal(plan.students[1]?.status, 'duplicate');
    assert.equal(plan.students[2]?.status, 'missing_ref');
    assert.equal(plan.students[3]?.status, 'new');
  });

  it('does not match students without enrollment by name', () => {
    const snapshot: ImportSnapshot = {
      ...filled,
      students: [
        {
          id: 'st1',
          name: 'Lia',
          schoolId: 's1',
          routeId: 'r1',
          boardingPoint: 'Porta',
          vehicleId: 'v1',
          seatNumber: 1,
        },
      ],
    };
    const buffer = bufferFromTables({
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Lia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '2'],
      ],
    });
    const plan = buildImportPlan(snapshot, buffer);
    assert.equal(plan.students[0]?.status, 'new');
  });

  it('rejects unknown boarding points and occupied seats without mutating other entities', () => {
    const snapshot: ImportSnapshot = {
      ...filled,
      students: [
        {
          id: 'st1',
          name: 'Lia',
          schoolId: 's1',
          routeId: 'r1',
          boardingPoint: 'Porta',
          vehicleId: 'v1',
          seatNumber: 1,
        },
      ],
    };
    snapshot.vehicles[0].seatsMap[0] = { seatNumber: 1, studentId: 'st1' };
    const buffer = bufferFromTables({
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Caio', 'ESC-01', 'Linha Centro', 'Rua Nova', 'ABC1D23', '2'],
        ['Bia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
      ],
    });
    const plan = buildImportPlan(snapshot, buffer);
    assert.equal(plan.students[0]?.status, 'missing_ref');
    assert.equal(plan.students[0]?.field, 'Ponto de embarque');
    assert.equal(plan.students[1]?.status, 'error');
    assert.equal(plan.students[1]?.field, 'Assento');
    assert.equal(plan.vehicles.length, 0);
    assert.equal(plan.routes.length, 0);
  });

  it('skips empty cells on school update', () => {
    const buffer = bufferFromTables({
      Escolas: [
        ['Registro', 'Nome', 'Telefone'],
        ['ESC-01', '', '(31) 98888-7777'],
      ],
    });
    const plan = buildImportPlan(filled, buffer);
    assert.equal(plan.schools[0]?.status, 'update');
    assert.equal(plan.schools[0]?.changes?.name, undefined);
    assert.equal(plan.schools[0]?.changes?.phone, '(31) 98888-7777');
  });

  it('reimport after export marks keyed rows as updates', () => {
    const snapshot: ImportSnapshot = {
      ...filled,
      students: [
        {
          id: 'st1',
          name: 'Lia',
          schoolId: 's1',
          routeId: 'r1',
          boardingPoint: 'Porta',
          vehicleId: 'v1',
          seatNumber: 1,
          enrollmentCode: '0123',
        },
        {
          id: 'st2',
          name: 'Leo',
          schoolId: 's1',
          routeId: 'r1',
          boardingPoint: 'Porta',
          vehicleId: 'v1',
          seatNumber: 2,
        },
      ],
    };
    const buffer = writeWorkbookBuffer(snapshot, [
      'vehicles',
      'schools',
      'routes',
      'students',
    ]);
    const plan = buildImportPlan(snapshot, buffer);
    assert.equal(plan.vehicles[0]?.status, 'update');
    assert.equal(plan.schools[0]?.status, 'update');
    assert.equal(plan.routes[0]?.status, 'update');
    const studentStatuses = plan.students.map((row) => row.status);
    assert.ok(studentStatuses.includes('update'));
    assert.ok(studentStatuses.includes('new'));
  });
});

describe('applyImportPlan', () => {
  it('persists valid rows and skips invalid ones; partial student import leaves vehicle plate', () => {
    const snapshot: ImportSnapshot = structuredClone(filled);
    snapshot.students = [
      {
        id: 'st1',
        name: 'Lia',
        schoolId: 's1',
        routeId: 'r1',
        boardingPoint: 'Porta',
        vehicleId: 'v1',
        seatNumber: 1,
        enrollmentCode: '0123',
      },
    ];
    snapshot.vehicles[0].seatsMap[0] = { seatNumber: 1, studentId: 'st1' };
    snapshot.schools[0].studentIds = ['st1'];

    const store = testStore(snapshot);
    const before = store.getState();
    const buffer = bufferFromTables({
      Alunos: [
        [
          'Carteirinha / Matrícula',
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['0123', 'Lia Nova', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
        ['x', 'Erro', 'Sem Escola', 'Linha Centro', 'Porta', 'ABC1D23', '2'],
      ],
    });
    const plan = buildImportPlan(snapshot, buffer);
    applyImportPlan(store.dispatch, store.getState, plan);
    const students = selectAllStudents(store.getState());
    const updated = students.find((item) => item.enrollmentCode === '0123');
    assert.equal(updated?.name, 'Lia Nova');
    assert.equal(students.length, 1);
    assert.equal(selectAllVehicles(store.getState())[0]?.plate, 'ABC1D23');
    assert.deepEqual(selectAllSchools(store.getState())[0]?.name, school.name);
    assert.notEqual(before.vehicles, undefined);
  });

  it('creates vehicle, school, route and student links in order', () => {
    const store = testStore({ vehicles: [], schools: [], routes: [], students: [] });
    const buffer = bufferFromTables({
      Veículos: [
        ['Placa', 'Responsável', 'Quantidade de assentos'],
        ['ABC1D23', 'João', '10'],
      ],
      Escolas: [['Nome', 'Registro'], ['Escola Nova', 'ESC-09']],
      Rotas: [
        [
          'Título',
          'Escola',
          'Responsável',
          'Monitor',
          'Ponto de início',
          'Horário início ida',
          'Horário término ida',
          'Horário início volta',
          'Horário término volta',
          'Período',
          'Tipo de operação',
          'Pontos de embarque',
        ],
        [
          'Linha Nova',
          'ESC-09',
          'Ana',
          'Bia',
          'Praça',
          '06:00',
          '07:00',
          '11:00',
          '12:00',
          'Manhã',
          'Ida e Volta',
          'Porta',
        ],
      ],
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Lia', 'ESC-09', 'Linha Nova', 'Porta', 'ABC1D23', '1'],
      ],
    });
    const plan = buildImportPlan(
      { vehicles: [], schools: [], routes: [], students: [] },
      buffer,
    );
    const summary = applyImportPlan(store.dispatch, store.getState, plan);
    assert.equal(summary.created, 4);
    const createdVehicle = selectAllVehicles(store.getState())[0];
    const createdSchool = selectAllSchools(store.getState())[0];
    const createdStudent = selectAllStudents(store.getState())[0];
    assert.equal(createdVehicle?.plate, 'ABC1D23');
    assert.equal(createdSchool?.name, 'Escola Nova');
    assert.equal(createdStudent?.schoolId, createdSchool?.id);
    assert.equal(createdStudent?.vehicleId, createdVehicle?.id);
  });
});

describe('review overlay', () => {
  it('selects an existing school by id without mutating the registry', () => {
    const extra: School = {
      id: 's2',
      name: 'Escola Municipal Alair Ferreira de Souza',
      studentIds: [],
      routeIds: [],
    };
    const snapshot: ImportSnapshot = {
      ...filled,
      schools: [school, extra],
    };
    const buffer = bufferFromTables({
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Lia', 'Escola XYZ', 'Linha Centro', 'Porta', 'ABC1D23', '8'],
      ],
    });
    const parsed = parseWorkbookBuffer(buffer);
    let session = createSession(snapshot, parsed, { fileName: 'a.xlsx', fileSize: 10 });
    assert.equal(session.plan.students[0]?.status, 'missing_ref');
    session = saveRowCorrections(session, snapshot, 'students', 2, [
      {
        field: 'school',
        originalValue: 'Escola XYZ',
        correctedValue: extra.name,
        selectedEntityId: school.id,
        selectedEntityLabel: school.name,
        selectedEntityKind: 'schools',
        reason: 'selected_reference',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    assert.equal(session.plan.students[0]?.status, 'new');
    assert.equal(session.plan.students[0]?.corrected, true);
    assert.equal(session.plan.students[0]?.create?.resolvedSchoolId, school.id);
    assert.equal(snapshot.schools[1]?.name, extra.name);
  });

  it('ignoring a new school invalidates dependent students and restore revalidates', () => {
    const buffer = bufferFromTables({
      Escolas: [
        ['Nome', 'Registro'],
        ['Nova Escola', 'ESC-02'],
      ],
      Rotas: [
        [
          'Título',
          'Escola',
          'Responsável',
          'Monitor',
          'Ponto de início',
          'Horário início ida',
          'Horário término ida',
          'Horário início volta',
          'Horário término volta',
          'Período',
          'Tipo de operação',
          'Pontos de embarque',
        ],
        [
          'Linha Nova',
          'ESC-02',
          'Ana',
          'Bia',
          'Praça',
          '06:00',
          '07:00',
          '11:00',
          '12:00',
          'Manhã',
          'Ida e Volta',
          'Porta',
        ],
      ],
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Lia', 'ESC-02', 'Linha Nova', 'Porta', 'ABC1D23', '8'],
      ],
    });
    const parsed = parseWorkbookBuffer(buffer);
    let session = createSession(filled, parsed, { fileName: 'b.xlsx', fileSize: 20 });
    assert.equal(session.plan.schools[0]?.status, 'new');
    assert.equal(session.plan.students[0]?.status, 'new');
    session = setRowDecision(session, filled, 'schools', 2, 'ignore');
    assert.equal(session.plan.schools[0]?.decision, 'ignore');
    assert.equal(session.plan.students[0]?.status, 'missing_ref');
    session = setRowDecision(session, filled, 'schools', 2, 'include');
    assert.equal(session.plan.students[0]?.status, 'new');
  });

  it('keeps a corrected row invalid and can create a duplicate conflict', () => {
    const snapshot: ImportSnapshot = {
      ...filled,
      students: [
        {
          id: 'st1',
          name: 'Lia',
          schoolId: 's1',
          routeId: 'r1',
          boardingPoint: 'Porta',
          vehicleId: 'v1',
          seatNumber: 1,
          enrollmentCode: '0123',
        },
      ],
    };
    const buffer = bufferFromTables({
      Alunos: [
        [
          'Carteirinha / Matrícula',
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['9999', 'Nova', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '2'],
      ],
    });
    const parsed = parseWorkbookBuffer(buffer);
    let session = createSession(snapshot, parsed, { fileName: 'c.xlsx', fileSize: 8 });
    session = saveRowCorrections(session, snapshot, 'students', 2, [
      {
        field: 'phone1',
        originalValue: '',
        correctedValue: '123',
        reason: 'manual_edit',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    assert.equal(session.plan.students[0]?.status, 'error');
    assert.equal(session.plan.students[0]?.corrected, true);
    session = saveRowCorrections(session, snapshot, 'students', 2, [
      {
        field: 'phone1',
        originalValue: '',
        correctedValue: '',
        reason: 'manual_edit',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        field: 'enrollmentCode',
        originalValue: '9999',
        correctedValue: '0123',
        reason: 'manual_edit',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    assert.equal(session.plan.students[0]?.status, 'update');
    assert.equal(session.plan.students[0]?.entityId, 'st1');
    session = removeRowCorrection(session, snapshot, 'students', 2, 'enrollmentCode');
    session = removeRowCorrection(session, snapshot, 'students', 2, 'phone1');
    assert.equal(session.plan.students[0]?.corrected, false);
    assert.equal(session.plan.students[0]?.status, 'new');
  });

  it('marks a duplicate conflict when a correction reuses another file enrollment', () => {
    const buffer = bufferFromTables({
      Alunos: [
        [
          'Carteirinha / Matrícula',
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['0001', 'Ana', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
        ['0002', 'Bia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '2'],
      ],
    });
    const parsed = parseWorkbookBuffer(buffer);
    let session = createSession(filled, parsed, { fileName: 'd.xlsx', fileSize: 8 });
    session = saveRowCorrections(session, filled, 'students', 3, [
      {
        field: 'enrollmentCode',
        originalValue: '0002',
        correctedValue: '0001',
        reason: 'manual_edit',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    assert.equal(session.plan.students[1]?.status, 'duplicate');
    assert.equal(session.source.sheets.students?.rows[1]?.values.enrollmentCode, '0002');
  });

  it('resolves a student boarding point from a new route in the same file', () => {
    const buffer = bufferFromTables({
      Veículos: [
        ['Placa', 'Responsável', 'Quantidade de assentos'],
        ['ABC1D23', 'João', '10'],
      ],
      Escolas: [['Nome', 'Registro'], ['Escola Centro', 'ESC-01']],
      Rotas: [
        [
          'Título',
          'Escola',
          'Responsável',
          'Monitor',
          'Ponto de início',
          'Horário início ida',
          'Horário término ida',
          'Horário início volta',
          'Horário término volta',
          'Período',
          'Tipo de operação',
          'Pontos de embarque',
        ],
        [
          'Linha Centro',
          'ESC-01',
          'Ana',
          'Bia',
          'Praça',
          '06:00',
          '07:00',
          '11:00',
          '12:00',
          'Manhã',
          'Ida e Volta',
          'Porta; Praça',
        ],
      ],
      Alunos: [
        [
          'Nome',
          'Escola',
          'Rota',
          'Ponto de embarque',
          'Veículo',
          'Assento',
        ],
        ['Lia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
      ],
    });
    const plan = buildImportPlan(
      { vehicles: [], schools: [], routes: [], students: [] },
      buffer,
    );
    assert.equal(plan.students[0]?.status, 'new');
    const vehicles = vehicleOptions({ vehicles: [], schools: [], routes: [], students: [] }, plan);
    const routes = routeOptions(
      { vehicles: [], schools: [], routes: [], students: [] },
      undefined,
      plan,
      'ESC-01',
    );
    const points = boardingPointOptions(
      { vehicles: [], schools: [], routes: [], students: [] },
      undefined,
      plan,
      'Linha Centro',
    );
    assert.ok(vehicles.some((item) => item.label === 'ABC1D23' && item.source === 'planned'));
    assert.ok(routes.some((item) => item.label === 'Linha Centro' && item.source === 'planned'));
    assert.ok(points.some((item) => item.label === 'Porta' && item.source === 'planned'));
    assert.ok(points.some((item) => item.label === 'Praça'));
  });
});
