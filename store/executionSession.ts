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
  };
}

export function buildOperationalPointsList(
  direction: RouteDirection,
  boardingPoints: string[],
  schoolId: string,
): string[] {
  if (direction === 'IDA') {
    return [...boardingPoints, schoolId];
  }
  return [schoolId, ...[...boardingPoints].reverse()];
}

export function isLastExecutionPoint(execution: ActiveExecution): boolean {
  return execution.currentPointIndex >= execution.pointsList.length - 1;
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
  const token = execution.pointsList[execution.currentPointIndex];
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
