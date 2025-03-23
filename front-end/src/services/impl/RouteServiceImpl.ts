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

  async createRouteWithSchool(routeData: any): Promise<any> {
    // Validate and convert schoolId to a number
    const schoolId = parseInt(routeData.schoolId);
    if (isNaN(schoolId) || schoolId <= 0) {
      console.error('Invalid school ID:', routeData.schoolId);
      throw new Error('A valid school ID is required to create a route');
    }

    console.log('Creating route with school ID:', schoolId);
    console.log('Route data:', routeData);
    console.log('Using base URL:', this.getBaseUrl());

    // Format stops data for the API
    const formattedStops = routeData.stops?.map((stop: any, index: number) => ({
      name: stop.name,
      address: stop.address || stop.name,
      latitude: stop.latitude !== undefined ? Number(stop.latitude) : 0,
      longitude: stop.longitude !== undefined ? Number(stop.longitude) : 0,
      estimatedMinutesFromStart: stop.estimatedMinutesFromStart !== undefined 
        ? Number(stop.estimatedMinutesFromStart) 
        : index * 5,
      sequence: stop.sequence !== undefined ? Number(stop.sequence) : index + 1
    })) || [];

    console.log('Formatted stops for API:', formattedStops);

    try {
      // First attempt: Use the /school/{schoolId} endpoint
      console.log(`Attempting to create route with school-specific endpoint: /api/v1/routes/school/${schoolId}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/routes/school/${schoolId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: routeData.name,
          description: routeData.description || '',
          type: routeData.type,
          schoolId: schoolId, // Explicitly include schoolId in body as well
          stops: formattedStops
        })
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to create route with school endpoint. Status: ${response.status}, Error: ${errorText}`);
        
        // If it's a 404 or 405, fall back to standard endpoint
        if (response.status === 404 || response.status === 405) {
          console.log('Falling back to standard route creation endpoint');
          
          // Second attempt: Use the standard route creation endpoint
          const fallbackResponse = await fetch(`${this.getBaseUrl()}/api/v1/routes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: routeData.name,
              description: routeData.description || '',
              type: routeData.type,
              schoolId: schoolId, // Ensure schoolId is included
              stops: formattedStops
            })
          });
          
          if (!fallbackResponse.ok) {
            const fallbackErrorText = await fallbackResponse.text();
            console.error(`Failed with fallback endpoint too. Status: ${fallbackResponse.status}, Error: ${fallbackErrorText}`);
            throw new Error(`Failed to create route: ${fallbackErrorText}`);
          }
          
          const result = await fallbackResponse.json();
          console.log('Route created successfully with fallback endpoint:', result);
          return result.data;
        }
        
        throw new Error(`Failed to create route: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Route created successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  async updateRoute(id: number, routeData: any): Promise<Route> {
    try {
      console.log(`Updating route ${id} with data:`, routeData);
      
      // Ensure schoolId is a valid number
      if (routeData.schoolId) {
        routeData.schoolId = parseInt(routeData.schoolId);
        if (isNaN(routeData.schoolId) || routeData.schoolId <= 0) {
          throw new Error("A valid schoolId is required for updating a route");
        }
      }
      
      // Format stops if present
      if (routeData.stops && Array.isArray(routeData.stops)) {
        // Ensure each stop has the required fields from RouteStopRequest
        routeData.stops = routeData.stops.map((stop: any, index: number) => ({
          name: stop.name,
          address: stop.address || stop.name,
          latitude: stop.latitude !== undefined ? Number(stop.latitude) : 0,
          longitude: stop.longitude !== undefined ? Number(stop.longitude) : 0,
          estimatedMinutesFromStart: stop.estimatedMinutesFromStart !== undefined 
            ? Number(stop.estimatedMinutesFromStart) 
            : index * 5
        }));
      }
      
      const response = await this.put<ApiResponse<Route>>(`/${id}`, routeData);
      console.log(`Route ${id} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating route ${id}:`, error);
      throw error;
    }
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
    try {
      console.log(`Adding stop to route ${routeId} with data:`, stopData);
      
      // Format the stop data - ensure sequence is present
      const formattedStopData = {
        ...stopData,
        sequence: stopData.sequence || 1
      };
      
      console.log('Formatted stop data:', formattedStopData);
      
      const token = localStorage.getItem('token');
      const baseUrl = this.getBaseUrl();

      console.log('Using API base URL for adding stop:', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/v1/routes/${routeId}/stops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedStopData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Error adding stop to route ${routeId}:`, response.status, errorData);
        throw new Error(`Failed to add stop: ${response.status} ${response.statusText}`);
      }
      
      console.log(`Stop successfully added to route ${routeId}`);
      return await response.json();
    } catch (error) {
      console.error('Error in addStop:', error);
      throw error;
    }
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

  private getBaseUrl(): string {
    // Determine the base URL based on the environment
    let baseUrl: string;
    
    if (typeof window !== 'undefined') {
      // We're in a browser environment
      if (window.location.origin.includes('localhost')) {
        baseUrl = 'http://localhost:8080';
        console.log('Running in localhost environment, using base URL:', baseUrl);
      } else {
        baseUrl = window.location.origin;
        console.log('Running in production environment, using origin as base URL:', baseUrl);
      }
    } else {
      // Default fallback for non-browser environments
      baseUrl = 'http://localhost:8080';
      console.log('Not in browser environment, using default base URL:', baseUrl);
    }
    
    return baseUrl;
  }
} 