import { RouteType } from '../entities/route.entity';

export interface RouteRequest {
  name: string;
  description?: string;
  type: RouteType;
}

export interface StopRequest {
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
} 