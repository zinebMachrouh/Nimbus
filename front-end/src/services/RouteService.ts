import { Route } from '../core/entities/route.entity';

export interface RouteService {
  getAllRoutes(): Promise<Route[]>;
  getRouteById(id: number): Promise<Route>;
  createRoute(routeData: any): Promise<Route>;
  updateRoute(id: number, routeData: any): Promise<Route>;
  deleteRoute(id: number): Promise<void>;
  findBySchoolId(schoolId: number): Promise<Route[]>;
  findByType(type: string): Promise<Route[]>;
  findByIdWithStops(id: number): Promise<Route>;
  findBySchoolAndType(schoolId: number, type: string): Promise<Route[]>;
  addStop(routeId: number, stopData: any): Promise<void>;
  updateStop(routeId: number, stopId: number, stopData: any): Promise<void>;
  removeStop(routeId: number, stopId: number): Promise<void>;
  reorderStops(routeId: number, stopIds: number[]): Promise<void>;
  assignToSchool(routeId: number, schoolId: number): Promise<void>;
  removeFromSchool(routeId: number): Promise<void>;
  findActiveRoutesWithStats(schoolId: number): Promise<Route[]>;
  getRouteStatistics(routeId: number): Promise<any>;
  countActiveStudentsOnRoute(routeId: number): Promise<number>;
  countCompletedTripsOnRoute(routeId: number): Promise<number>;
  calculateRouteDistance(routeId: number): Promise<number>;
  estimateRouteDuration(routeId: number): Promise<number>;
} 