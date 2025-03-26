import { Driver } from './driver.entity';
import { Route } from './route.entity';
import { Vehicle } from './vehicle.entity';
import { Student } from './student.entity';

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Attendance {
  id: number;
  student: Student;
  trip: Trip;
  status: 'PENDING' | 'PRESENT' | 'ABSENT' | 'ABSENT_NOTIFIED' | 'EXCUSED';
  scanTime?: string;
  notes?: string;
  parentNotified: boolean;
  seatNumber: number;
  qrCode: string;
}

export interface Trip {
  id: number;
  routeId: number;
  driverId: number;
  vehicleId: number;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  status: TripStatus;
  notes?: string;
  route?: Route;
  driver?: Driver;
  vehicle?: Vehicle;
  students?: Student[];
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  cancellationReason?: string;
  attendances?: Attendance[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TripRequest {
  routeId: number;
  driverId: number;
  vehicleId: number;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  notes?: string;
  status?: TripStatus;
}

export interface TripDTO {
  id: number;
  name: string;
} 