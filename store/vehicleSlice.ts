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
      const { vehicleId, seatNumber, studentId } = action.payload;
      const vehicle = state.entities[vehicleId];
      if (!vehicle) {
        return;
      }

      const seat = vehicle.seatsMap.find((item) => item.seatNumber === seatNumber);
      if (seat) {
        seat.studentId = studentId;
        return;
      }

      vehicle.seatsMap.push({ seatNumber, studentId });
    },
    removeSeat(
      state,
      action: PayloadAction<{ vehicleId: string; seatNumber: number }>,
    ) {
      const { vehicleId, seatNumber } = action.payload;
      const vehicle = state.entities[vehicleId];
      if (!vehicle) {
        return;
      }

      const seat = vehicle.seatsMap.find((item) => item.seatNumber === seatNumber);
      if (seat) {
        seat.studentId = null;
      }
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
