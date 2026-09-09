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
    addBoardingPointToRoute(
      state,
      action: PayloadAction<{ routeId: string; pointName: string }>,
    ) {
      const { routeId, pointName } = action.payload;
      const route = state.entities[routeId];
      if (!route) {
        return;
      }

      const normalized = pointName.trim();
      if (!normalized || route.boardingPoints.includes(normalized)) {
        return;
      }

      route.boardingPoints.push(normalized);
    },
  },
});

export const {
  addOne: addRoute,
  updateOne: updateRoute,
  removeOne: removeRoute,
  addBoardingPointToRoute,
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
