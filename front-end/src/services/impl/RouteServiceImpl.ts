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
    try {
      console.log(`Attempting to delete route ${id}`);
      
      // First check if the route exists
      try {
        const route = await this.getRouteById(id);
        console.log(`Route ${id} found, proceeding with deletion`);
      } catch (error) {
        console.error(`Route ${id} not found, cannot delete:`, error);
        throw new Error(`Route with ID ${id} not found or cannot be accessed`);
      }
      
      // Proceed with deletion
      await this.delete<ApiResponse<void>>(`/${id}`);
      console.log(`Route ${id} successfully deleted`);
    } catch (error) {
      console.error(`Failed to delete route ${id}:`, error);
      throw error;
    }
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
    try {
      // Try the with-stops endpoint first
      console.log(`Attempting to fetch route ${id} with stops using combined endpoint`);
      const response = await this.get<ApiResponse<Route>>(`/${id}/with-stops`);
      return response.data;
    } catch (error) {
      console.log(`Combined endpoint failed, fetching route and stops separately for route ${id}`);
      
      // Fallback: Get the route data first
      const route = await this.getRouteById(id);
      
      try {
        // Then try to get the stops for this route
        const stopsResponse = await this.get<ApiResponse<any[]>>(`/${id}/stops`);
        
        // Add the stops to the route object
        return {
          ...route,
          stops: stopsResponse.data || []
        };
      } catch (stopError) {
        console.warn(`Could not fetch stops for route ${id}:`, stopError);
        // Return the route without stops if we couldn't get them
        return {
          ...route,
          stops: []
        };
      }
    }
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
    try {
      const response = await this.get<ApiResponse<number>>(`/${routeId}/trips/count`);
      return response.data;
    } catch (error) {
      console.warn(`Could not count trips for route ${routeId}:`, error);
      // If the endpoint fails, return 0 as a safe fallback
      return 0;
    }
  }

  async calculateRouteDistance(routeId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/${routeId}/distance`);
    return response.data;
  }

  async estimateRouteDuration(routeId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/${routeId}/duration`);
    return response.data;
  }

  /**
   * Check if a route is associated with any trips
   * @param routeId The ID of the route to check
   * @returns Object containing the number of trips associated with the route
   */
  async checkRouteTrips(routeId: number): Promise<{ tripCount: number }> {
    try {
      console.log(`Checking if route ${routeId} has any associated trips`);
      // Use the existing trip count endpoint
      const count = await this.countCompletedTripsOnRoute(routeId);
      console.log(`Route ${routeId} has ${count} associated trips`);
      return { tripCount: count };
    } catch (error) {
      console.error(`Error checking trips for route ${routeId}:`, error);
      // If the endpoint is not available or returns an error, assume no trips for safety
      console.log(`Assuming route ${routeId} has no trips due to error response`);
      return { tripCount: 0 };
    }
  }

  /**
   * Update the active status of a route
   * @param routeId The ID of the route to update
   * @param active The new active status
   */
  async updateRouteStatus(routeId: number, active: boolean): Promise<void> {
    try {
      console.log(`Updating route ${routeId} status to ${active ? 'active' : 'inactive'}`);
      
      // Use a direct fetch request to ensure we have complete control over the request
      const token = localStorage.getItem('token');
      const baseUrl = this.getBaseUrl();
      console.log('Using base URL:', baseUrl);
      
      // Create a minimal payload with just the active field
      const payload = { active: active };
      console.log('Update payload:', payload);
      
      console.log(`Attempting PATCH request to ${baseUrl}/api/v1/routes/${routeId}`);
      const response = await fetch(`${baseUrl}/api/v1/routes/${routeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log('PATCH response status:', response.status);
      
      if (!response.ok) {
        // If PATCH fails, try PUT as a fallback
        console.log(`PATCH request failed with ${response.status}, trying PUT as fallback`);
        
        // First we need to get the current route data
        console.log(`Fetching current route data for ${routeId}`);
        const currentRoute = await this.getRouteById(routeId);
        
        if (!currentRoute) {
          throw new Error(`Route with ID ${routeId} not found`);
        }
        
        console.log('Current route data:', currentRoute);
        
        // Update only the active field while preserving all other data
        const routeData = {
          ...currentRoute,
          active: active
        };
        
        console.log('PUT request payload:', routeData);
        console.log(`Attempting PUT request to ${baseUrl}/api/v1/routes/${routeId}`);
        
        // Use PUT with complete route data
        const putResponse = await fetch(`${baseUrl}/api/v1/routes/${routeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(routeData)
        });
        
        console.log('PUT response status:', putResponse.status);
        
        if (!putResponse.ok) {
          const errorText = await putResponse.text();
          console.error('PUT response error text:', errorText);
          throw new Error(`Failed to update route status: ${putResponse.status} ${errorText}`);
        } else {
          const responseData = await putResponse.text();
          console.log('PUT response data:', responseData);
        }
      } else {
        const responseData = await response.text();
        console.log('PATCH response data:', responseData);
      }
      
      console.log(`Route ${routeId} status updated successfully to ${active ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error(`Error updating status for route ${routeId}:`, error);
      throw error;
    }
  }

  /**
   * Specifically restore an inactive route (set it back to active)
   * This method is more targeted than updateRouteStatus
   * @param routeId The ID of the route to restore
   */
  async restoreRoute(routeId: number): Promise<void> {
    try {
      console.log(`Attempting to restore route ${routeId}`);
      
      const token = localStorage.getItem('token');
      const baseUrl = this.getBaseUrl();
      
      // Try using a direct API call with fetch for more control
      const response = await fetch(`${baseUrl}/api/v1/routes/${routeId}/restore`, {
        method: 'POST', // Some APIs use POST for restore operations
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If the restore endpoint doesn't exist, try a simple update
      if (response.status === 404) {
        console.log('Restore endpoint not found, falling back to regular update');
        
        // Get current route
        const route = await this.getRouteById(routeId);
        
        if (!route) {
          throw new Error(`Route ${routeId} not found`);
        }
        
        // Try a simple direct PUT with minimal data
        const updateResponse = await fetch(`${baseUrl}/api/v1/routes/${routeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...route,
            active: true
          })
        });
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Failed to restore route: ${updateResponse.status} ${errorText}`);
        }
        
        console.log(`Route ${routeId} restored successfully via update`);
      } else if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to restore route: ${response.status} ${errorText}`);
      } else {
        console.log(`Route ${routeId} restored successfully via dedicated endpoint`);
      }
    } catch (error) {
      console.error(`Error restoring route ${routeId}:`, error);
      throw error;
    }
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