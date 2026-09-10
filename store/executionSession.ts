import { localDateKey } from '@/lib/localDate';
import type { RouteDirection } from '@/types';
import type {
  ActiveExecution,
  ExecutionStudentAttendance,
  PointLogStatus,
  RouteHistory,
} from '@/types/execution';

export function nowIso(): string {
  return new Date().toISOString();
}

export function appendPointLog(
  execution: ActiveExecution,
  pointId: string,
  status: PointLogStatus,
  timestamp = nowIso(),
): void {
  if (!pointId) {
    return;
  }
  if (execution.pointLogs.some((log) => log.pointId === pointId)) {
    return;
  }
  execution.pointLogs.push({ pointId, status, timestamp });
}

export function toRouteHistory(
  execution: ActiveExecution,
  finishedAt: string,
): RouteHistory {
  const values = Object.values(execution.attendances);
  return {
    id: execution.id,
    routeId: execution.routeId,
    schoolId: execution.schoolId,
    direction: execution.direction,
    startedAt: execution.startedAt,
    finishedAt,
    attendances: Object.fromEntries(
      Object.entries(execution.attendances).map(([studentId, record]) => [
        studentId,
        { ...record },
      ]),
    ),
    pointLogs: execution.pointLogs.map((log) => ({ ...log })),
    metrics: {
      present: values.filter((item) => item.status === 'DROPPED_OFF').length,
      absent: values.filter((item) => item.status === 'ABSENT').length,
      skippedPoints: execution.pointLogs.filter((log) => log.status === 'SKIPPED')
        .length,
    },
    ...(execution.cycleJustification
      ? { cycleJustification: { ...execution.cycleJustification } }
      : {}),
  };
}

export function latestCompletedIda(
  history: RouteHistory[],
  routeId: string,
  dayKey: string,
): RouteHistory | undefined {
  return history
    .filter(
      (trip) =>
        trip.direction === 'IDA' &&
        trip.routeId === routeId &&
        localDateKey(trip.startedAt) === dayKey,
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export function incompleteIdaTrip(
  history: RouteHistory[],
  routeId: string,
): RouteHistory | undefined {
  if (!routeId) {
    return undefined;
  }
  const trips = history
    .filter((trip) => trip.routeId === routeId)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const last = trips[trips.length - 1];
  if (!last || last.direction !== 'IDA') {
    return undefined;
  }
  return last;
}

export function absentStudentIdsFromTrip(
  trip: RouteHistory | undefined,
): Record<string, true> {
  const ids: Record<string, true> = {};
  if (!trip) {
    return ids;
  }
  for (const record of Object.values(trip.attendances)) {
    if (record.status === 'ABSENT') {
      ids[record.studentId] = true;
    }
  }
  return ids;
}

function asStopLabel(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function uniqueRouteStops(
  startPoint: string,
  boardingPoints: string[],
): string[] {
  const start = asStopLabel(startPoint);
  const rest = (Array.isArray(boardingPoints) ? boardingPoints : [])
    .map((point) => asStopLabel(point))
    .filter((point) => point.length > 0 && point !== start);
  return start.length > 0 ? [start, ...rest] : rest;
}

export function buildOperationalPointsList(
  direction: RouteDirection,
  startPoint: string,
  boardingPoints: string[],
  schoolId: string,
): string[] {
  const stops = uniqueRouteStops(startPoint, boardingPoints);
  if (direction === 'IDA') {
    return [...stops, schoolId];
  }
  return [schoolId, ...[...stops].reverse()];
}

export function isLastExecutionPoint(execution: ActiveExecution): boolean {
  const points = execution.pointsList ?? [];
  if (points.length === 0) {
    return false;
  }
  return execution.currentPointIndex >= points.length - 1;
}

export function isDropoffStop(execution: ActiveExecution): boolean {
  if (execution.direction === 'IDA') {
    return isLastExecutionPoint(execution);
  }
  return execution.currentPointIndex > 0;
}

export function hasPresentStudents(execution: ActiveExecution): boolean {
  return Object.values(execution.attendances).some(
    (item) => item.status === 'PRESENT',
  );
}

export function studentsForCurrentPoint(
  execution: ActiveExecution,
): ExecutionStudentAttendance[] {
  const token = (execution.pointsList ?? [])[execution.currentPointIndex];
  const all = Object.values(execution.attendances);
  if (!token) {
    return [];
  }

  if (isDropoffStop(execution)) {
    if (execution.direction === 'IDA') {
      return all.filter((item) => item.status === 'PRESENT');
    }
    return all.filter(
      (item) => item.status === 'PRESENT' && item.boardingPoint === token,
    );
  }

  if (execution.direction === 'VOLTA' && token === execution.schoolId) {
    return all.filter((item) => item.status === 'PENDING');
  }

  return all.filter(
    (item) => item.status === 'PENDING' && item.boardingPoint === token,
  );
}

export function isPointComplete(execution: ActiveExecution): boolean {
  return studentsForCurrentPoint(execution).length === 0;
}

export function canFinishRoute(execution: ActiveExecution): boolean {
  return (
    execution.status === 'IN_PROGRESS' &&
    isLastExecutionPoint(execution) &&
    !hasPresentStudents(execution)
  );
}
