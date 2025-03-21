import { BaseEntity } from './base.entity';
import { School } from './school.entity';
import { Trip } from './trip.entity';

export enum RouteType {
  MORNING_PICKUP = 'MORNING_PICKUP',
  AFTERNOON_DROPOFF = 'AFTERNOON_DROPOFF'
}

export interface RouteStop {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedMinutesFromStart: number;
}

export interface Route extends BaseEntity {
  name: string;
  description: string;
  trips?: Trip[];
  school: School;
  type: RouteType;
  stops: RouteStop[];
  activeStudentsCount?: number;
  completedTripsCount?: number;
  totalDistance?: number;
  estimatedDuration?: number;
} 