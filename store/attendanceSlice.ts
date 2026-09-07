import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  AfternoonStatus,
  MorningStatus,
  Shift,
  Student,
  StudentAttendance,
} from '@/types/attendance';

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

export type AttendanceState = {
  students: Student[];
  attendance: Record<string, StudentAttendance>;
  shift: Shift;
};

const initialState: AttendanceState = {
  students: MOCK_STUDENTS,
  attendance: {},
  shift: 'morning',
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
  },
});

export const { setShift, setMorningStatus, setAfternoonStatus } =
  attendanceSlice.actions;

export const selectStudents = (state: { attendance: AttendanceState }) =>
  state.attendance.students;
export const selectAttendance = (state: { attendance: AttendanceState }) =>
  state.attendance.attendance;
export const selectShift = (state: { attendance: AttendanceState }) =>
  state.attendance.shift;

export default attendanceSlice.reducer;
