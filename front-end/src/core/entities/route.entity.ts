import { School } from './school.entity';
import { Stop } from './stop.entity';

export enum RouteType {
  MORNING_PICKUP = 'MORNING_PICKUP',
  AFTERNOON_DROPOFF = 'AFTERNOON_DROPOFF'
}

export interface Route {
  id: number;
  name: string;
  description?: string;
  type: RouteType;
  stops?: Stop[];
  school?: School;
  distance?: number;
  duration?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
} 