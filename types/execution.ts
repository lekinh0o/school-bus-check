import type { RouteDirection } from '@/types';

export type ExecutionStatus = 'PENDING' | 'PRESENT' | 'ABSENT' | 'DROPPED_OFF';

export type PointLogStatus = 'COMPLETED' | 'SKIPPED';

export type PointLog = {
  pointId: string;
  status: PointLogStatus;
  timestamp: string;
};

export type ExecutionStudentAttendance = {
  studentId: string;
  boardingPoint: string;
  status: ExecutionStatus;
  recordedAt?: string;
};

export type ExecutionMetrics = {
  present: number;
  absent: number;
  skippedPoints: number;
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
  startedAt: string;
  pointLogs: PointLog[];
};

export type RouteHistory = {
  id: string;
  routeId: string;
  schoolId: string;
  direction: RouteDirection;
  startedAt: string;
  finishedAt: string;
  pointLogs: PointLog[];
  attendances: Record<string, ExecutionStudentAttendance>;
  metrics: ExecutionMetrics;
};
