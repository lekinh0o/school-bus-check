export type Shift = 'morning' | 'afternoon';

/** Eventos do turno da manhã (ida para a escola). */
export type MorningStatus = 'boarding_home' | 'absent_morning' | 'school_dropoff';

/** Eventos do turno da tarde (volta para casa). */
export type AfternoonStatus =
  | 'boarding_school'
  | 'absent_afternoon'
  | 'home_dropoff';

export type AttendanceStatus = MorningStatus | AfternoonStatus;

export type Student = {
  id: string;
  name: string;
  grade: string;
  pickupAddress: string;
};

export type StudentAttendance = {
  studentId: string;
  morning?: MorningStatus;
  afternoon?: AfternoonStatus;
};
