export type SeatAssignment = {
  seatNumber: number;
  studentId: string | null;
};

export type Vehicle = {
  id: string;
  plate: string;
  responsible: string;
  totalSeats: number;
  seatsMap: SeatAssignment[];
  photoUri?: string;
};

export type School = {
  id: string;
  name: string;
  address: string;
  principal: string;
  phone: string;
  studentIds: string[];
  routeIds: string[];
};

export type RoutePeriod = 'Manha' | 'Tarde' | 'Noite';

export type Route = {
  id: string;
  responsible: string;
  monitor: string;
  startPoint: string;
  streetsCovered: string[];
  schoolId: string;
  startTime: string;
  endTime: string;
  period: RoutePeriod;
};

export type Student = {
  id: string;
  name: string;
  age: number;
  responsible: string;
  contactPhones: string[];
  schoolId: string;
  grade: string;
  routeId: string;
  boardingStreet: string;
  vehicleId: string;
  seatNumber: number;
};
