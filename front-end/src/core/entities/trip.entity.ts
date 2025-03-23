import { Driver } from './driver.entity';
import { Route } from './route.entity';
import { Vehicle } from './vehicle.entity';
import { Attendance } from './attendance.entity';

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Trip {
  id: number;
  scheduledDepartureTime: string;
  actualDepartureTime?: string;
  scheduledArrivalTime?: string;
  actualArrivalTime?: string;
  status: TripStatus;
  notes?: string;
  cancellationReason?: string;
  driver?: Driver;
  vehicle?: Vehicle;
  route?: Route;
  attendances?: Attendance[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
} 