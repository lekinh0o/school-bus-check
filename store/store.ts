import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createMigrate,
  persistReducer,
  persistStore,
  type MigrationManifest,
  type PersistedState,
} from 'redux-persist';

import attendanceReducer from './attendanceSlice';
import routeReducer from './routeSlice';
import schoolReducer from './schoolSlice';
import { storage } from './storage';
import studentReducer from './studentSlice';
import vehicleReducer from './vehicleSlice';

const rootReducer = combineReducers({
  attendance: attendanceReducer,
  vehicles: vehicleReducer,
  schools: schoolReducer,
  routes: routeReducer,
  students: studentReducer,
});

type PersistedEntitySlice = {
  ids?: string[];
  entities?: Record<string, Record<string, unknown>>;
};

const migrations: MigrationManifest = {
  2: (state: PersistedState) => {
    if (!state || typeof state !== 'object') {
      return state;
    }

    const root = state as PersistedState & { routes?: PersistedEntitySlice };
    const routes = root.routes;
    if (!routes?.entities) {
      return state;
    }

    const entities = { ...routes.entities };
    for (const id of Object.keys(entities)) {
      const route = entities[id];
      if (!route) {
        continue;
      }
      const startPoint =
        typeof route.startPoint === 'string' && route.startPoint.length > 0
          ? route.startPoint
          : 'Rota';
      entities[id] = {
        ...route,
        title:
          typeof route.title === 'string' && route.title.length > 0
            ? route.title
            : startPoint,
        direction: route.direction === 'VOLTA' ? 'VOLTA' : 'IDA',
      };
    }

    return {
      ...root,
      routes: {
        ...routes,
        entities,
      },
    };
  },
  3: (state: PersistedState) => {
    if (!state || typeof state !== 'object') {
      return state;
    }

    const root = state as PersistedState & {
      routes?: PersistedEntitySlice;
      students?: PersistedEntitySlice;
    };

    const routes = root.routes;
    let nextRoutes = routes;
    if (routes?.entities) {
      const entities = { ...routes.entities };
      for (const id of Object.keys(entities)) {
        const route = entities[id];
        if (!route) {
          continue;
        }
        const { direction: _direction, streetsCovered, ...rest } = route;
        const boardingPoints = Array.isArray(rest.boardingPoints)
          ? rest.boardingPoints.filter((item): item is string => typeof item === 'string')
          : Array.isArray(streetsCovered)
            ? streetsCovered.filter((item): item is string => typeof item === 'string')
            : [];
        entities[id] = {
          ...rest,
          boardingPoints,
        };
      }
      nextRoutes = { ...routes, entities };
    }

    const students = root.students;
    let nextStudents = students;
    if (students?.entities) {
      const entities = { ...students.entities };
      for (const id of Object.keys(entities)) {
        const student = entities[id];
        if (!student) {
          continue;
        }
        const { boardingStreet, ...rest } = student;
        const boardingPoint =
          typeof rest.boardingPoint === 'string' && rest.boardingPoint.length > 0
            ? rest.boardingPoint
            : typeof boardingStreet === 'string'
              ? boardingStreet
              : '';
        entities[id] = {
          ...rest,
          boardingPoint,
        };
      }
      nextStudents = { ...students, entities };
    }

    return {
      ...root,
      routes: nextRoutes,
      students: nextStudents,
    };
  },
  4: (state: PersistedState) => {
    if (!state || typeof state !== 'object') {
      return state;
    }
    const root = state as PersistedState & {
      attendance?: {
        executionHistory?: unknown;
        activeExecution?: Record<string, unknown> | null;
      };
    };
    const attendance = root.attendance;
    if (!attendance || typeof attendance !== 'object') {
      return state;
    }
    const active = attendance.activeExecution;
    let nextActive = active ?? null;
    if (active && typeof active === 'object') {
      nextActive = {
        ...active,
        startedAt:
          typeof active.startedAt === 'string' ? active.startedAt : '',
        pointLogs: Array.isArray(active.pointLogs) ? active.pointLogs : [],
      };
    }
    return {
      ...root,
      attendance: {
        ...attendance,
        executionHistory: Array.isArray(attendance.executionHistory)
          ? attendance.executionHistory
          : [],
        activeExecution: nextActive,
      },
    };
  },
};

const persistConfig = {
  key: 'root',
  storage,
  version: 4,
  timeout: 0,
  migrate: createMigrate(migrations, { debug: false }),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store, {
  manualPersist: true,
} as never);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
