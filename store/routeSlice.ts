import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { Route } from '@/types';

export const routesAdapter = createEntityAdapter<Route, string>({
  selectId: (route) => route.id,
});

export type RoutesState = ReturnType<typeof routesAdapter.getInitialState>;

const routeSlice = createSlice({
  name: 'routes',
  initialState: routesAdapter.getInitialState(),
  reducers: {
    addOne: routesAdapter.addOne,
    updateOne: routesAdapter.updateOne,
    removeOne: routesAdapter.removeOne,
    addStreetToRoute(
      state,
      action: PayloadAction<{ routeId: string; streetName: string }>,
    ) {
      const { routeId, streetName } = action.payload;
      const route = state.entities[routeId];
      if (!route) {
        return;
      }

      const normalized = streetName.trim();
      if (!normalized || route.streetsCovered.includes(normalized)) {
        return;
      }

      route.streetsCovered.push(normalized);
    },
  },
});

export const {
  addOne: addRoute,
  updateOne: updateRoute,
  removeOne: removeRoute,
  addStreetToRoute,
} = routeSlice.actions;

export const routeSelectors = routesAdapter.getSelectors(
  (state: { routes: RoutesState }) => state.routes,
);

export const {
  selectAll: selectAllRoutes,
  selectById: selectRouteById,
  selectIds: selectRouteIds,
  selectEntities: selectRouteEntities,
  selectTotal: selectRouteTotal,
} = routeSelectors;

export default routeSlice.reducer;
