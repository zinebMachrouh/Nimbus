import { BaseEntity } from './base.entity';
import { Route } from './route.entity';
import { Driver } from './driver.entity';
import { Vehicle } from './vehicle.entity';
import { AttendanceEntity } from './attendance.entity.ts';

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Trip extends BaseEntity {
  route: Route;
  driver: Driver;
  vehicle: Vehicle;
  scheduledDepartureTime: Date;
  actualDepartureTime?: Date;
  actualArrivalTime?: Date;
  status: TripStatus;
  attendances?: AttendanceEntity[];
  notes?: string;
} 