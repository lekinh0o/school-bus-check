import type { RouteDirection } from '@/types';
import type { ActiveExecution, ExecutionStudentAttendance } from '@/types/execution';

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
