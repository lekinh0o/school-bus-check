import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { Vehicle } from '@/types';

export const vehiclesAdapter = createEntityAdapter<Vehicle, string>({
  selectId: (vehicle) => vehicle.id,
});

export type VehiclesState = ReturnType<typeof vehiclesAdapter.getInitialState>;

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: vehiclesAdapter.getInitialState(),
  reducers: {
    addOne: vehiclesAdapter.addOne,
    updateOne: vehiclesAdapter.updateOne,
    removeOne: vehiclesAdapter.removeOne,
    assignSeat(
      state,
      action: PayloadAction<{
        vehicleId: string;
        seatNumber: number;
        studentId: string;
      }>,
    ) {
      const { vehicleId, studentId } = action.payload;
      const seatNumber = Number(action.payload.seatNumber);
      const vehicle = state.entities[vehicleId];
      if (!vehicle) {
        return;
      }

      const current = vehicle.seatsMap ?? [];
      let found = false;
      const seatsMap = current.map((item) => {
        if (Number(item.seatNumber) !== seatNumber) {
          return item;
        }
        found = true;
        return { ...item, seatNumber, studentId };
      });
      if (!found) {
        seatsMap.push({ seatNumber, studentId });
      }

      vehiclesAdapter.updateOne(state, {
        id: vehicleId,
        changes: { seatsMap },
      });
    },
    removeSeat(
      state,
      action: PayloadAction<{ vehicleId: string; seatNumber: number }>,
    ) {
      const { vehicleId } = action.payload;
      const seatNumber = Number(action.payload.seatNumber);
      const vehicle = state.entities[vehicleId];
      if (!vehicle?.seatsMap) {
        return;
      }

      vehiclesAdapter.updateOne(state, {
        id: vehicleId,
        changes: {
          seatsMap: vehicle.seatsMap.map((item) =>
            Number(item.seatNumber) === seatNumber
              ? { ...item, studentId: null }
              : item,
          ),
        },
      });
    },
  },
});

export const {
  addOne: addVehicle,
  updateOne: updateVehicle,
  removeOne: removeVehicle,
  assignSeat,
  removeSeat,
} = vehicleSlice.actions;

export const vehicleSelectors = vehiclesAdapter.getSelectors(
  (state: { vehicles: VehiclesState }) => state.vehicles,
);

export const {
  selectAll: selectAllVehicles,
  selectById: selectVehicleById,
  selectIds: selectVehicleIds,
  selectEntities: selectVehicleEntities,
  selectTotal: selectVehicleTotal,
} = vehicleSelectors;

export default vehicleSlice.reducer;
