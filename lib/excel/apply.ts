import type { Dispatch } from '@reduxjs/toolkit';

import { createBoardingPoint } from '../boardingPoints';
import {
  addRoute,
  selectAllRoutes,
  updateRoute,
} from '../../store/routeSlice';
import {
  addSchool,
  selectAllSchools,
  updateSchool,
} from '../../store/schoolSlice';
import { addStudent, selectAllStudents, updateStudent } from '../../store/studentSlice';
import type { RoutesState } from '../../store/routeSlice';
import type { SchoolsState } from '../../store/schoolSlice';
import type { StudentsState } from '../../store/studentSlice';
import type { VehiclesState } from '../../store/vehicleSlice';
import {
  addVehicle,
  assignSeat,
  removeSeat,
  selectAllVehicles,
  updateVehicle,
} from '../../store/vehicleSlice';
import type { OperationType, RoutePeriod, Student } from '../../types';

import { validPlate } from './normalize';
import type { ImportPlan, PlannedRow } from './types';

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function withId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

function withoutId(ids: string[], id: string): string[] {
  return ids.filter((item) => item !== id);
}

function isPersistable(row: PlannedRow): boolean {
  return row.status === 'new' || row.status === 'update';
}

export type ExcelStoreState = {
  vehicles: VehiclesState;
  schools: SchoolsState;
  routes: RoutesState;
  students: StudentsState;
};

function resolveSchoolId(
  state: ExcelStoreState,
  ref: string | undefined,
): string | undefined {
  if (!ref) {
    return undefined;
  }
  const schools = selectAllSchools(state);
  const byRegistry = schools.filter((item) => item.registry === ref.trim());
  if (byRegistry.length === 1) {
    return byRegistry[0].id;
  }
  const byName = schools.filter((item) => item.name === ref.trim());
  if (byName.length === 1) {
    return byName[0].id;
  }
  return undefined;
}

function resolveRouteId(
  state: ExcelStoreState,
  title: string | undefined,
  schoolId: string | undefined,
): string | undefined {
  if (!title || !schoolId) {
    return undefined;
  }
  const matches = selectAllRoutes(state).filter(
    (item) => item.title === title && item.schoolId === schoolId,
  );
  return matches.length === 1 ? matches[0].id : undefined;
}

function resolveVehicleId(state: ExcelStoreState, plate: string | undefined): string | undefined {
  const formatted = plate ? validPlate(plate) : undefined;
  if (!formatted) {
    return undefined;
  }
  const matches = selectAllVehicles(state).filter((item) => item.plate === formatted);
  return matches.length === 1 ? matches[0].id : undefined;
}

export function applyImportPlan(
  dispatch: Dispatch,
  getState: () => ExcelStoreState,
  plan: ImportPlan,
) {
  for (const row of plan.vehicles.filter(isPersistable)) {
    if (row.status === 'new' && row.create) {
      const totalSeats = Number(row.create.totalSeats);
      dispatch(
        addVehicle({
          id: newId(),
          plate: String(row.create.plate),
          responsible: String(row.create.responsible),
          totalSeats,
          seatsMap: Array.from({ length: totalSeats }, (_, index) => ({
            seatNumber: index + 1,
            studentId: null,
          })),
        }),
      );
    } else if (row.status === 'update' && row.entityId && row.changes) {
      const { responsible, totalSeats } = row.changes;
      dispatch(
        updateVehicle({
          id: row.entityId,
          changes: {
            ...(typeof responsible === 'string' ? { responsible } : {}),
            ...(typeof totalSeats === 'number' ? { totalSeats } : {}),
          },
        }),
      );
    }
  }

  for (const row of plan.schools.filter(isPersistable)) {
    if (row.status === 'new' && row.create) {
      dispatch(
        addSchool({
          id: newId(),
          name: String(row.create.name),
          address: row.create.address as string | undefined,
          principal: row.create.principal as string | undefined,
          phone: row.create.phone as string | undefined,
          registry: row.create.registry as string | undefined,
          latitude: row.create.latitude as number | undefined,
          longitude: row.create.longitude as number | undefined,
          studentIds: [],
          routeIds: [],
        }),
      );
    } else if (row.status === 'update' && row.entityId && row.changes) {
      const changes = { ...row.changes };
      delete changes.schoolRef;
      dispatch(
        updateSchool({
          id: row.entityId,
          changes,
        }),
      );
    }
  }

  for (const row of plan.routes.filter(isPersistable)) {
    const payload = row.status === 'new' ? row.create : row.changes;
    if (!payload) {
      continue;
    }
    const state = getState();
    const schoolId = resolveSchoolId(state, String(payload.schoolRef ?? ''));
    if (!schoolId) {
      continue;
    }
    const pointNames = Array.isArray(payload.boardingPoints)
      ? (payload.boardingPoints as string[])
      : undefined;
    if (row.status === 'new' && row.create) {
      const id = newId();
      dispatch(
        addRoute({
          id,
          title: String(row.create.title),
          responsible: String(row.create.responsible),
          monitor: String(row.create.monitor),
          startPoint: String(row.create.startPoint),
          boardingPoints: (pointNames ?? []).map((name) => createBoardingPoint(name)),
          schoolId,
          departureTimeIda: String(row.create.departureTimeIda),
          arrivalTimeIda: String(row.create.arrivalTimeIda),
          departureTimeVolta: String(row.create.departureTimeVolta),
          arrivalTimeVolta: String(row.create.arrivalTimeVolta),
          period: row.create.period as RoutePeriod,
          operationType: row.create.operationType as OperationType,
        }),
      );
      const school = selectAllSchools(getState()).find((item) => item.id === schoolId);
      if (school) {
        dispatch(
          updateSchool({
            id: school.id,
            changes: { routeIds: withId(school.routeIds, id) },
          }),
        );
      }
    } else if (row.status === 'update' && row.entityId) {
      const existing = selectAllRoutes(state).find((item) => item.id === row.entityId);
      dispatch(
        updateRoute({
          id: row.entityId,
          changes: {
            ...(typeof payload.responsible === 'string'
              ? { responsible: payload.responsible }
              : {}),
            ...(typeof payload.monitor === 'string' ? { monitor: payload.monitor } : {}),
            ...(typeof payload.startPoint === 'string'
              ? { startPoint: payload.startPoint }
              : {}),
            ...(typeof payload.title === 'string' ? { title: payload.title } : {}),
            ...(typeof payload.departureTimeIda === 'string'
              ? { departureTimeIda: payload.departureTimeIda }
              : {}),
            ...(typeof payload.arrivalTimeIda === 'string'
              ? { arrivalTimeIda: payload.arrivalTimeIda }
              : {}),
            ...(typeof payload.departureTimeVolta === 'string'
              ? { departureTimeVolta: payload.departureTimeVolta }
              : {}),
            ...(typeof payload.arrivalTimeVolta === 'string'
              ? { arrivalTimeVolta: payload.arrivalTimeVolta }
              : {}),
            ...(payload.period ? { period: payload.period as RoutePeriod } : {}),
            ...(payload.operationType
              ? { operationType: payload.operationType as OperationType }
              : {}),
            ...(pointNames
              ? { boardingPoints: pointNames.map((name) => createBoardingPoint(name)) }
              : {}),
            schoolId,
          },
        }),
      );
      if (existing && existing.schoolId !== schoolId) {
        const previous = selectAllSchools(getState()).find(
          (item) => item.id === existing.schoolId,
        );
        if (previous) {
          dispatch(
            updateSchool({
              id: previous.id,
              changes: { routeIds: withoutId(previous.routeIds, row.entityId) },
            }),
          );
        }
        const nextSchool = selectAllSchools(getState()).find((item) => item.id === schoolId);
        if (nextSchool) {
          dispatch(
            updateSchool({
              id: nextSchool.id,
              changes: { routeIds: withId(nextSchool.routeIds, row.entityId) },
            }),
          );
        }
      }
    }
  }

  for (const row of plan.students.filter(isPersistable)) {
    const payload = row.status === 'new' ? row.create : row.changes;
    if (!payload) {
      continue;
    }
    const state = getState();
    const schoolId = resolveSchoolId(state, String(payload.schoolRef ?? ''));
    const routeId = resolveRouteId(
      state,
      payload.routeTitle as string | undefined,
      schoolId,
    );
    const vehicleId = resolveVehicleId(state, payload.vehiclePlate as string | undefined);
    const seatNumber = Number(payload.seatNumber);
    const boardingPoint = String(payload.boardingPoint ?? '');
    if (!schoolId || !routeId || !vehicleId || !boardingPoint || !seatNumber) {
      continue;
    }

    const fields: Partial<Student> = {
      schoolId,
      routeId,
      vehicleId,
      seatNumber,
      boardingPoint,
    };
    if (typeof payload.name === 'string') {
      fields.name = payload.name;
    }
    if (typeof payload.age === 'number') {
      fields.age = payload.age;
    }
    if (typeof payload.responsible === 'string') {
      fields.responsible = payload.responsible;
    }
    if (Array.isArray(payload.contactPhones)) {
      fields.contactPhones = payload.contactPhones as string[];
    }
    if (typeof payload.grade === 'string') {
      fields.grade = payload.grade;
    }
    if (typeof payload.enrollmentCode === 'string') {
      fields.enrollmentCode = payload.enrollmentCode;
    }

    if (row.status === 'new' && row.create) {
      const id = newId();
      dispatch(
        addStudent({
          id,
          name: String(row.create.name),
          age: fields.age,
          responsible: fields.responsible,
          contactPhones: fields.contactPhones,
          schoolId,
          grade: fields.grade,
          routeId,
          boardingPoint,
          vehicleId,
          seatNumber,
          enrollmentCode: fields.enrollmentCode,
        }),
      );
      dispatch(assignSeat({ vehicleId, seatNumber, studentId: id }));
      const school = selectAllSchools(getState()).find((item) => item.id === schoolId);
      if (school) {
        dispatch(
          updateSchool({
            id: school.id,
            changes: { studentIds: withId(school.studentIds, id) },
          }),
        );
      }
    } else if (row.status === 'update' && row.entityId) {
      const existing = selectAllStudents(state).find((item) => item.id === row.entityId);
      if (
        existing &&
        (existing.vehicleId !== vehicleId || existing.seatNumber !== seatNumber)
      ) {
        dispatch(
          removeSeat({
            vehicleId: existing.vehicleId,
            seatNumber: existing.seatNumber,
          }),
        );
      }
      dispatch(updateStudent({ id: row.entityId, changes: fields }));
      dispatch(assignSeat({ vehicleId, seatNumber, studentId: row.entityId }));
      if (existing && existing.schoolId !== schoolId) {
        const previous = selectAllSchools(getState()).find(
          (item) => item.id === existing.schoolId,
        );
        if (previous) {
          dispatch(
            updateSchool({
              id: previous.id,
              changes: { studentIds: withoutId(previous.studentIds, row.entityId) },
            }),
          );
        }
        const nextSchool = selectAllSchools(getState()).find((item) => item.id === schoolId);
        if (nextSchool) {
          dispatch(
            updateSchool({
              id: nextSchool.id,
              changes: { studentIds: withId(nextSchool.studentIds, row.entityId) },
            }),
          );
        }
      }
    }
  }
}
