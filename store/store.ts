import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import attendanceReducer from './attendanceSlice';
import routeReducer from './routeSlice';
import schoolReducer from './schoolSlice';
import studentReducer from './studentSlice';
import vehicleReducer from './vehicleSlice';

export const store = configureStore({
  reducer: {
    attendance: attendanceReducer,
    vehicles: vehicleReducer,
    schools: schoolReducer,
    routes: routeReducer,
    students: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
