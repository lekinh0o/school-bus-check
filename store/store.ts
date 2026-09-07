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

type PersistedRoutes = {
  ids?: string[];
  entities?: Record<string, Record<string, unknown>>;
};

const migrations: MigrationManifest = {
  2: (state: PersistedState) => {
    if (!state || typeof state !== 'object') {
      return state;
    }

    const root = state as PersistedState & { routes?: PersistedRoutes };
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
};

const persistConfig = {
  key: 'root',
  storage,
  version: 2,
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
