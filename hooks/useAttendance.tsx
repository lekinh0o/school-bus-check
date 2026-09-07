import {
  selectAttendance,
  selectShift,
  selectStudents,
  setAfternoonStatus,
  setMorningStatus,
  setShift,
} from '@/store/attendanceSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { AfternoonStatus, MorningStatus, Shift } from '@/types/attendance';

export function useAttendance() {
  const dispatch = useAppDispatch();
  const students = useAppSelector(selectStudents);
  const attendance = useAppSelector(selectAttendance);
  const shift = useAppSelector(selectShift);

  return {
    students,
    attendance,
    shift,
    setShift: (nextShift: Shift) => dispatch(setShift(nextShift)),
    setMorningStatus: (studentId: string, status: MorningStatus) =>
      dispatch(setMorningStatus({ studentId, status })),
    setAfternoonStatus: (studentId: string, status: AfternoonStatus) =>
      dispatch(setAfternoonStatus({ studentId, status })),
  };
}
