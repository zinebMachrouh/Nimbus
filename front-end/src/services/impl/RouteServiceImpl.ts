import { RouteService } from '../RouteService';
import { Route } from '../../core/entities/route.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class RouteServiceImpl extends BaseHttpService implements RouteService {
  constructor() {
    super('/v1/routes');
  }

  async getAllRoutes(): Promise<Route[]> {
    const response = await this.get<ApiResponse<Route[]>>();
    return response.data;
  }

  async getRouteById(id: number): Promise<Route> {
    const response = await this.get<ApiResponse<Route>>(`/${id}`);
    return response.data;
  }

  async createRoute(routeData: any): Promise<Route> {
    const response = await this.post<ApiResponse<Route>>('', routeData);
    return response.data;
  }

  async updateRoute(id: number, routeData: any): Promise<Route> {
    const response = await this.put<ApiResponse<Route>>(`/${id}`, routeData);
    return response.data;
  }

  async deleteRoute(id: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${id}`);
  }

  async findBySchoolId(schoolId: number): Promise<Route[]> {
    const response = await this.get<ApiResponse<Route[]>>(`/school/${schoolId}`);
    return response.data;
  }

  async findByType(type: string): Promise<Route[]> {
    const response = await this.get<ApiResponse<Route[]>>(`/type/${type}`);
    return response.data;
  }

  async findByIdWithStops(id: number): Promise<Route> {
    const response = await this.get<ApiResponse<Route>>(`/${id}/with-stops`);
    return response.data;
  }

  async findBySchoolAndType(schoolId: number, type: string): Promise<Route[]> {
    const response = await this.get<ApiResponse<Route[]>>(`/school/${schoolId}/type/${type}`);
    return response.data;
  }

  async addStop(routeId: number, stopData: any): Promise<void> {
    await this.post<ApiResponse<void>>(`/${routeId}/stops`, stopData);
  }

  async updateStop(routeId: number, stopId: number, stopData: any): Promise<void> {
    await this.put<ApiResponse<void>>(`/${routeId}/stops/${stopId}`, stopData);
  }

  async removeStop(routeId: number, stopId: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${routeId}/stops/${stopId}`);
  }

  async reorderStops(routeId: number, stopIds: number[]): Promise<void> {
    await this.put<ApiResponse<void>>(`/${routeId}/stops/reorder`, stopIds);
  }

  async assignToSchool(routeId: number, schoolId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${routeId}/assign-school/${schoolId}`);
  }

  async removeFromSchool(routeId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${routeId}/remove-school`);
  }

  async findActiveRoutesWithStats(schoolId: number): Promise<Route[]> {
    const response = await this.get<ApiResponse<Route[]>>(`/school/${schoolId}/with-stats`);
    return response.data;
  }

  async getRouteStatistics(routeId: number): Promise<any> {
    const response = await this.get<ApiResponse<any>>(`/${routeId}/statistics`);
    return response.data;
  }

  async countActiveStudentsOnRoute(routeId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/${routeId}/students/count`);
    return response.data;
  }

  async countCompletedTripsOnRoute(routeId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/${routeId}/trips/count`);
    return response.data;
  }

  async calculateRouteDistance(routeId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/${routeId}/distance`);
    return response.data;
  }

  async estimateRouteDuration(routeId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/${routeId}/duration`);
    return response.data;
  }
} 