import type { RouteDirection } from '@/types';

export type ExecutionStatus = 'PENDING' | 'PRESENT' | 'ABSENT' | 'DROPPED_OFF';

export type ExecutionStudentAttendance = {
  studentId: string;
  boardingPoint: string;
  status: ExecutionStatus;
};

export type ActiveExecution = {
  id: string;
  routeId: string;
  schoolId: string;
  direction: RouteDirection;
  currentPointIndex: number;
  pointsList: string[];
  skippedPoints: string[];
  attendances: Record<string, ExecutionStudentAttendance>;
  status: 'IN_PROGRESS' | 'COMPLETED';
};
