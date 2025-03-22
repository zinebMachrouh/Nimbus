import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { School } from './school.entity';
import { Trip } from './trip.entity';

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  OFF_DUTY = 'OFF_DUTY',
  ON_LEAVE = 'ON_LEAVE'
}

export interface Driver extends User {
  licenseNumber: string;
  licenseExpiryDate: string;
  phoneNumber: string;
  address?: string;
  vehicle?: Vehicle;
  school?: School;
  trips?: Trip[];
  experience?: number;
  rating?: number;
  currentLatitude?: number;
  currentLongitude?: number;
  status: DriverStatus;
  completedTripsCount?: number;
  totalDistance?: number;
  activeTripsCount?: number;
} 