import { Driver } from './driver.entity';
import { School } from './school.entity';
import { Trip } from './trip.entity';

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface Vehicle {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  status: VehicleStatus;
  insuranceExpiryDate: string;
  registrationExpiryDate: string;
  lastMaintenanceDate: string;
  currentMileage: number;
  trackingDeviceId?: string;
  createdAt: string;
  updatedAt: string;
  driver?: Driver;
  school?: School;
  trips?: Trip[];
  currentLatitude?: number;
  currentLongitude?: number;
  completedTripsCount?: number;
  totalMileage?: number;
  activeTripsCount?: number;
} 