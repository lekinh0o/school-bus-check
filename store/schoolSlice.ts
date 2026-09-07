import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { School } from '@/types';

export const schoolsAdapter = createEntityAdapter<School, string>({
  selectId: (school) => school.id,
});

export type SchoolsState = ReturnType<typeof schoolsAdapter.getInitialState>;

const schoolSlice = createSlice({
  name: 'schools',
  initialState: schoolsAdapter.getInitialState(),
  reducers: {
    addOne: schoolsAdapter.addOne,
    updateOne: schoolsAdapter.updateOne,
    removeOne: schoolsAdapter.removeOne,
  },
});

export const {
  addOne: addSchool,
  updateOne: updateSchool,
  removeOne: removeSchool,
} = schoolSlice.actions;

export const schoolSelectors = schoolsAdapter.getSelectors(
  (state: { schools: SchoolsState }) => state.schools,
);

export const {
  selectAll: selectAllSchools,
  selectById: selectSchoolById,
  selectIds: selectSchoolIds,
  selectEntities: selectSchoolEntities,
  selectTotal: selectSchoolTotal,
} = schoolSelectors;

export default schoolSlice.reducer;
