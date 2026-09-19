import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import * as XLSX from 'xlsx';

import { confirmImportPlan } from './confirm';
import { ImportReviewController } from './controller';
import { MemoryDraftStore } from './draft';
import { filterPlanRows } from './reviewModel';
import { createSession, saveRowCorrections } from './session';
import type { ImportSnapshot } from './types';
import { parseWorkbookBuffer } from './workbook';
import routeReducer, { addRoute, selectAllRoutes } from '../../store/routeSlice';
import schoolReducer, { addSchool, removeSchool, selectAllSchools } from '../../store/schoolSlice';
import studentReducer, { addStudent, selectAllStudents } from '../../store/studentSlice';
import vehicleReducer, { addVehicle, selectAllVehicles } from '../../store/vehicleSlice';
import { createBoardingPoint } from '../boardingPoints';
import type { Route, School, Vehicle } from '../../types';

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
  const copy = structuredClone(snapshot);
  const store = configureStore({
    reducer: combineReducers({
      vehicles: vehicleReducer,
      schools: schoolReducer,
      routes: routeReducer,
      students: studentReducer,
    }),
  });
  for (const item of copy.vehicles) {
    store.dispatch(addVehicle(item));
  }
  for (const item of copy.schools) {
    store.dispatch(addSchool(item));
  }
  for (const item of copy.routes) {
    store.dispatch(addRoute(item));
  }
  for (const item of copy.students) {
    store.dispatch(addStudent(item));
  }
  return store;
}

function snapshotOf(store: ReturnType<typeof testStore>): ImportSnapshot {
  const state = store.getState();
  return {
    vehicles: selectAllVehicles(state),
    schools: selectAllSchools(state),
    routes: selectAllRoutes(state),
    students: selectAllStudents(state),
  };
}

const studentSheet = {
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
};

describe('import review controller', () => {
  it('walks analysis, review, correction feedback and confirmation without React Native', async () => {
    const store = new MemoryDraftStore();
    const controller = new ImportReviewController(store);
    const buffer = bufferFromTables(studentSheet);
    await controller.startFromFile(
      filled,
      new Uint8Array(buffer),
      'cadastro.xlsx',
      buffer.byteLength,
    );
    assert.equal(controller.getState().step, 'analysis');
    controller.goReview();
    assert.equal(controller.getState().step, 'review');
    const problems = controller.visibleRows();
    assert.ok(problems.length >= 1);
    controller.openCorrection(problems[0].rowKey);
    assert.equal(controller.getState().step, 'correction');
    await controller.saveCorrections(filled, 'students', 3, [
      {
        field: 'school',
        originalValue: 'Sem Escola',
        correctedValue: 'ainda inválido',
        reason: 'manual_edit',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    assert.equal(controller.getState().step, 'correction');
    assert.equal(controller.getState().lastFeedback?.success, false);
    await controller.saveCorrections(filled, 'students', 3, [
      {
        field: 'school',
        originalValue: 'Sem Escola',
        correctedValue: 'ESC-01',
        reason: 'manual_edit',
        correctedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    assert.equal(controller.getState().step, 'correction-feedback');
    assert.equal(controller.getState().lastFeedback?.success, true);
    controller.goConfirmation();
    assert.equal(controller.getState().step, 'confirmation');
    controller.backToReview();
    assert.equal(controller.getState().step, 'review');
  });

  it('filters problems, eligible, ignored and search together', async () => {
    const store = new MemoryDraftStore();
    const controller = new ImportReviewController(store);
    const buffer = bufferFromTables(studentSheet);
    await controller.startFromFile(filled, new Uint8Array(buffer), 'a.xlsx', 10);
    const session = controller.getState().session!;
    controller.setFilter('problems');
    assert.equal(controller.visibleRows().every((row) => row.validation !== 'valid' || row.decision === 'ignore'), true);
    controller.setFilter('eligible');
    assert.ok(controller.visibleRows().length >= 1);
    controller.setFilter('all');
    controller.setQuery('erro');
    assert.equal(controller.visibleRows()[0]?.effectiveValues.name?.toLowerCase().includes('erro'), true);
    const ignored = filterPlanRows(session.plan, 'ignored', '');
    assert.equal(ignored.length, 0);
  });

  it('does not mark saved while a background flush is still pending, and keeps save_error visible', async () => {
    const draft = new MemoryDraftStore();
    const controller = new ImportReviewController(draft);
    const buffer = bufferFromTables(studentSheet);
    await controller.startFromFile(filled, new Uint8Array(buffer), 'a.xlsx', 10);
    draft.failNextWrite = true;
    await controller.setDecision(filled, 'students', 3, 'ignore');
    assert.equal(controller.getState().saveStatus, 'save_error');
    await controller.handleAppState('background');
    assert.equal(controller.getState().saveStatus, 'save_error');
    assert.equal(controller.getState().flushingBackground, false);
  });

  it('blocks importAll, requires an explicit eligible choice, and keeps the draft on failure', async () => {
    const redux = testStore(filled);
    const draft = new MemoryDraftStore();
    const controller = new ImportReviewController(draft);
    const buffer = bufferFromTables(studentSheet);
    await controller.startFromFile(filled, new Uint8Array(buffer), 'a.xlsx', 10);
    let dispatches = 0;
    const dispatch = ((action: never) => {
      dispatches += 1;
      return redux.dispatch(action);
    }) as typeof redux.dispatch;
    const blocked = await controller.confirm(filled, 'importAll', dispatch, redux.getState);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.reason, 'blocked');
    }
    assert.equal(dispatches, 0);
    const implicit = await controller.confirm(filled, 'importEligible', dispatch, redux.getState);
    assert.equal(implicit.ok, false);
    if (!implicit.ok) {
      assert.equal(implicit.reason, 'needs_explicit');
    }
    assert.equal(dispatches, 0);
    assert.equal(await draft.hasActive(), true);
  });

  it('revalidates against current store changes and dispatches nothing in that attempt', async () => {
    const redux = testStore(filled);
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
        ['Lia', 'ESC-01', 'Linha Centro', 'Porta', 'ABC1D23', '1'],
      ],
    });
    const parsed = parseWorkbookBuffer(buffer);
    const session = createSession(filled, parsed, { fileName: 'a.xlsx', fileSize: 4 });
    redux.dispatch(removeSchool('s1'));
    let dispatches = 0;
    const dispatch = ((action: never) => {
      dispatches += 1;
      return redux.dispatch(action);
    }) as typeof redux.dispatch;
    const result = confirmImportPlan({
      session,
      snapshot: snapshotOf(redux),
      mode: 'importAll',
      dispatch,
      getState: redux.getState,
    });
    assert.equal(result.ok, false);
    assert.equal(dispatches, 0);
    assert.equal(selectAllStudents(redux.getState()).length, 0);
  });

  it('imports only eligible rows, then removes the draft, and preserves it when apply is blocked', async () => {
    const redux = testStore(filled);
    const draft = new MemoryDraftStore();
    const controller = new ImportReviewController(draft);
    const buffer = bufferFromTables(studentSheet);
    await controller.startFromFile(filled, new Uint8Array(buffer), 'a.xlsx', 10);
    const result = await controller.confirm(
      filled,
      'importEligible',
      redux.dispatch,
      redux.getState,
      true,
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.summary.created >= 1, true);
      assert.equal(result.summary.skipped >= 1, true);
    }
    assert.equal(await draft.hasActive(), false);
    assert.equal(selectAllStudents(redux.getState()).some((item) => item.name === 'Lia Nova'), true);
  });
});

describe('session source immutability', () => {
  it('keeps parsed source cells unchanged after a correction', () => {
    const buffer = bufferFromTables(studentSheet);
    const parsed = parseWorkbookBuffer(buffer);
    const original = parsed.sheets.students?.rows[0]?.values.name;
    const session = saveRowCorrections(
      createSession(filled, parsed, { fileName: 'a.xlsx', fileSize: 1 }),
      filled,
      'students',
      2,
      [
        {
          field: 'name',
          originalValue: original,
          correctedValue: 'Outro',
          reason: 'manual_edit',
          correctedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    );
    assert.equal(session.source.sheets.students?.rows[0]?.values.name, original);
    assert.equal(session.plan.students[0]?.effectiveValues.name, 'Outro');
  });
});

describe('unreadable workbook', () => {
  it('clears busy and surfaces the parser failure from startFromFile', async () => {
    const draft = new MemoryDraftStore();
    const controller = new ImportReviewController(draft);
    await assert.rejects(
      () =>
        controller.startFromFile(
          filled,
          new Uint8Array([0, 1, 2, 3, 4]),
          'broken.bin',
          5,
        ),
    );
    assert.equal(controller.getState().busy, false);
    assert.equal(controller.getState().session, null);
  });
});
