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
  photoUri?: string;
};

export type RoutePeriod = 'Manha' | 'Tarde' | 'Noite';

export type RouteDirection = 'IDA' | 'VOLTA';

export type Route = {
  id: string;
  title: string;
  responsible: string;
  monitor: string;
  startPoint: string;
  boardingPoints: string[];
  schoolId: string;
  startTime: string;
  endTime: string;
  period: RoutePeriod;
  responsiblePhotoUri?: string;
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
  boardingPoint: string;
  vehicleId: string;
  seatNumber: number;
  photoUri?: string;
};
