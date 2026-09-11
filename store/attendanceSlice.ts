import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { localDateKey } from '@/lib/localDate';
import type { RouteDirection } from '@/types';
import type {
  AfternoonStatus,
  MorningStatus,
  Shift,
  Student,
  StudentAttendance,
} from '@/types/attendance';
import type {
  ActiveExecution,
  CycleJustification,
  ExecutionStatus,
  RouteHistory,
} from '@/types/execution';

import {
  appendPointLog,
  buildOperationalPointsList,
  canFinishRoute as computeCanFinishRoute,
  hasPresentStudents,
  incompleteIdaTrip,
  isDropoffStop,
  isLastExecutionPoint,
  isPointComplete as computeIsPointComplete,
  nowIso,
  studentsForCurrentPoint,
  toRouteHistory,
  latestCompletedIda,
  absentStudentIdsFromTrip,
} from './executionSession';

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Ana Souza',
    grade: '3º ano',
    pickupAddress: 'Rua das Palmeiras, 120',
  },
  {
    id: '2',
    name: 'Pedro Lima',
    grade: '5º ano',
    pickupAddress: 'Av. Central, 45',
  },
  {
    id: '3',
    name: 'Marina Costa',
    grade: '2º ano',
    pickupAddress: 'Rua do Sol, 88',
  },
];

export type StartRouteExecutionPayload = {
  routeId: string;
  schoolId: string;
  direction: RouteDirection;
  startPoint: string;
  boardingPoints: string[];
  students: { studentId: string; boardingPoint: string }[];
  cycleJustification?: CycleJustification;
};

export type AttendanceState = {
  students: Student[];
  attendance: Record<string, StudentAttendance>;
  shift: Shift;
  activeExecution: ActiveExecution | null;
  executionHistory: RouteHistory[];
};

const initialState: AttendanceState = {
  students: MOCK_STUDENTS,
  attendance: {},
  shift: 'morning',
  activeExecution: null,
  executionHistory: [],
};

type AttendanceRoot = {
  attendance: AttendanceState;
  schools: { entities: Record<string, { name?: string } | undefined> };
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setShift(state, action: PayloadAction<Shift>) {
      state.shift = action.payload;
    },
    setMorningStatus(
      state,
      action: PayloadAction<{ studentId: string; status: MorningStatus }>,
    ) {
      const { studentId, status } = action.payload;
      const current = state.attendance[studentId];
      state.attendance[studentId] = { ...current, studentId, morning: status };
    },
    setAfternoonStatus(
      state,
      action: PayloadAction<{ studentId: string; status: AfternoonStatus }>,
    ) {
      const { studentId, status } = action.payload;
      const current = state.attendance[studentId];
      state.attendance[studentId] = { ...current, studentId, afternoon: status };
    },
    startRouteExecution(state, action: PayloadAction<StartRouteExecutionPayload>) {
      const {
        routeId,
        schoolId,
        direction,
        startPoint,
        boardingPoints,
        students,
        cycleJustification,
      } = action.payload;
      const attendances: ActiveExecution['attendances'] = {};
      for (const student of students) {
        const boardingPoint =
          typeof student.boardingPoint === 'string'
            ? student.boardingPoint.trim()
            : '';
        if (!boardingPoint) {
          continue;
        }
        attendances[student.studentId] = {
          studentId: student.studentId,
          boardingPoint,
          status: 'PENDING',
        };
      }
      state.activeExecution = {
        id: Date.now().toString(),
        routeId,
        schoolId,
        direction,
        currentPointIndex: 0,
        pointsList: buildOperationalPointsList(
          direction,
          startPoint,
          boardingPoints,
          schoolId,
        ),
        skippedPoints: [],
        attendances,
        status: 'IN_PROGRESS',
        startedAt: nowIso(),
        pointLogs: [],
        ...(cycleJustification ? { cycleJustification } : {}),
      };
    },
    markStudentStatus(
      state,
      action: PayloadAction<{ studentId: string; status: ExecutionStatus }>,
    ) {
      const execution = state.activeExecution;
      if (!execution || execution.status !== 'IN_PROGRESS') {
        return;
      }
      const record = execution.attendances[action.payload.studentId];
      if (!record) {
        return;
      }
      const wasOnCurrentPoint = studentsForCurrentPoint(execution).some(
        (item) => item.studentId === action.payload.studentId,
      );
      const next = action.payload.status;
      const previous = record.status;
      if (next === 'PENDING' && (record.status === 'PRESENT' || record.status === 'ABSENT')) {
        record.status = 'PENDING';
      } else if (next === 'PRESENT' && record.status !== 'DROPPED_OFF') {
        record.status = 'PRESENT';
      } else if (next === 'ABSENT' && record.status !== 'DROPPED_OFF') {
        record.status = 'ABSENT';
      } else if (record.status === 'PRESENT' && next === 'DROPPED_OFF') {
        record.status = next;
      }
      if (record.status !== previous) {
        record.recordedAt = nowIso();
      }
      if (
        wasOnCurrentPoint &&
        next !== 'PENDING' &&
        computeIsPointComplete(execution) &&
        !isLastExecutionPoint(execution)
      ) {
        const token = (execution.pointsList ?? [])[execution.currentPointIndex];
        if (token) {
          appendPointLog(execution, token, 'COMPLETED');
        }
        execution.currentPointIndex += 1;
      }
    },
    advanceToNextPoint(state) {
      const execution = state.activeExecution;
      if (!execution || execution.status !== 'IN_PROGRESS') {
        return;
      }
      if (isLastExecutionPoint(execution) || !computeIsPointComplete(execution)) {
        return;
      }
      const token = (execution.pointsList ?? [])[execution.currentPointIndex];
      if (token) {
        appendPointLog(execution, token, 'COMPLETED');
      }
      execution.currentPointIndex += 1;
    },
    goToPreviousPoint(state) {
      const execution = state.activeExecution;
      if (!execution || execution.status !== 'IN_PROGRESS') {
        return;
      }
      if (execution.currentPointIndex <= 0) {
        return;
      }
      execution.currentPointIndex -= 1;
    },
    skipCurrentPoint(state) {
      const execution = state.activeExecution;
      if (!execution || execution.status !== 'IN_PROGRESS') {
        return;
      }
      if (isLastExecutionPoint(execution) || isDropoffStop(execution)) {
        return;
      }
      const token = (execution.pointsList ?? [])[execution.currentPointIndex];
      if (token) {
        execution.skippedPoints.push(token);
        appendPointLog(execution, token, 'SKIPPED');
      }
      execution.currentPointIndex += 1;
    },
    finishRouteExecution(state) {
      const execution = state.activeExecution;
      if (!execution || execution.status !== 'IN_PROGRESS') {
        return;
      }
      if (hasPresentStudents(execution) || !isLastExecutionPoint(execution)) {
        return;
      }
      const token = (execution.pointsList ?? [])[execution.currentPointIndex];
      if (token) {
        appendPointLog(execution, token, 'COMPLETED');
      }
      const finishedAt = nowIso();
      execution.status = 'COMPLETED';
      if (!state.executionHistory) {
        state.executionHistory = [];
      }
      state.executionHistory.unshift(toRouteHistory(execution, finishedAt));
      state.activeExecution = null;
    },
    justifyIncompleteCycle(
      state,
      action: PayloadAction<{
        routeId: string;
        justification: CycleJustification;
      }>,
    ) {
      const trips = (state.executionHistory ?? [])
        .filter((trip) => trip.routeId === action.payload.routeId)
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
      const last = trips[trips.length - 1];
      if (!last || last.direction !== 'IDA') {
        return;
      }
      last.cycleJustification = { ...action.payload.justification };
    },
  },
});

export const {
  setShift,
  setMorningStatus,
  setAfternoonStatus,
  startRouteExecution,
  markStudentStatus,
  advanceToNextPoint,
  goToPreviousPoint,
  skipCurrentPoint,
  finishRouteExecution,
  justifyIncompleteCycle,
} = attendanceSlice.actions;

export const selectStudents = (state: AttendanceRoot) => state.attendance.students;
export const selectAttendance = (state: AttendanceRoot) =>
  state.attendance.attendance;
export const selectShift = (state: AttendanceRoot) => state.attendance.shift;
export const selectActiveExecution = (state: AttendanceRoot) =>
  state.attendance.activeExecution ?? null;
export const selectExecutionHistory = (state: AttendanceRoot) =>
  state.attendance.executionHistory ?? [];

export const selectCurrentPointName = createSelector(
  [selectActiveExecution, (state: AttendanceRoot) => state.schools.entities],
  (execution, schools) => {
    if (!execution) {
      return '';
    }
    const token = (execution.pointsList ?? [])[execution.currentPointIndex];
    if (!token) {
      return '';
    }
    if (token === execution.schoolId) {
      return schools[execution.schoolId]?.name ?? 'Escola';
    }
    return token;
  },
);

export const selectExecutionStats = createSelector(
  [selectActiveExecution],
  (execution) => {
    if (!execution) {
      return { pending: 0, present: 0, absent: 0, droppedOff: 0, total: 0 };
    }
    const values = Object.values(execution.attendances);
    return {
      pending: values.filter((item) => item.status === 'PENDING').length,
      present: values.filter((item) => item.status === 'PRESENT').length,
      absent: values.filter((item) => item.status === 'ABSENT').length,
      droppedOff: values.filter((item) => item.status === 'DROPPED_OFF').length,
      total: values.length,
    };
  },
);

export const selectStudentsForCurrentPoint = createSelector(
  [selectActiveExecution],
  (execution) => (execution ? studentsForCurrentPoint(execution) : []),
);

export const selectIsPointComplete = createSelector(
  [selectActiveExecution],
  (execution) => (execution ? computeIsPointComplete(execution) : false),
);

export const selectCanFinishRoute = createSelector(
  [selectActiveExecution],
  (execution) => (execution ? computeCanFinishRoute(execution) : false),
);

export const selectIncompleteIdaTrip = createSelector(
  [
    selectExecutionHistory,
    (_state: AttendanceRoot, routeId: string) => routeId,
  ],
  (history, routeId) => incompleteIdaTrip(history, routeId),
);

export const selectHasCompletedIdaToday = createSelector(
  [
    selectExecutionHistory,
    (_state: AttendanceRoot, routeId: string) => routeId,
  ],
  (history, routeId) => {
    if (!routeId) {
      return false;
    }
    return Boolean(latestCompletedIda(history, routeId, localDateKey()));
  },
);

export const selectIdaAbsentStudentIds = createSelector(
  [selectExecutionHistory, selectActiveExecution],
  (history, execution) => {
    if (!execution || execution.direction !== 'VOLTA') {
      return {} as Record<string, true>;
    }
    const ida = latestCompletedIda(
      history,
      execution.routeId,
      localDateKey(execution.startedAt),
    );
    return absentStudentIdsFromTrip(ida);
  },
);

export default attendanceSlice.reducer;
