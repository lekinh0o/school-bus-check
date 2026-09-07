import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { Student } from '@/types';

export const studentsAdapter = createEntityAdapter<Student, string>({
  selectId: (student) => student.id,
});

export type StudentsState = ReturnType<typeof studentsAdapter.getInitialState>;

const studentSlice = createSlice({
  name: 'students',
  initialState: studentsAdapter.getInitialState(),
  reducers: {
    addOne: studentsAdapter.addOne,
    updateOne: studentsAdapter.updateOne,
    removeOne: studentsAdapter.removeOne,
  },
});

export const {
  addOne: addStudent,
  updateOne: updateStudent,
  removeOne: removeStudent,
} = studentSlice.actions;

export const studentSelectors = studentsAdapter.getSelectors(
  (state: { students: StudentsState }) => state.students,
);

export const {
  selectAll: selectAllStudents,
  selectById: selectStudentById,
  selectIds: selectStudentIds,
  selectEntities: selectStudentEntities,
  selectTotal: selectStudentTotal,
} = studentSelectors;

export default studentSlice.reducer;
