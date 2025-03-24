import { Trip, TripRequest, TripStatus } from '../entities/trip.entity';
import { apiClient } from '../utils/apiClient';

export class TripService {
  private readonly baseUrl = '/api/v1/trips';

  async getAllTrips(): Promise<Trip[]> {
    const response = await apiClient.get<Trip[]>(this.baseUrl);
    return response.data;
  }

  async createTrip(trip: TripRequest): Promise<Trip> {
    const response = await apiClient.post<Trip>(this.baseUrl, trip);
    return response.data;
  }

  async updateTrip(id: number, trip: TripRequest): Promise<Trip> {
    const response = await apiClient.put<Trip>(`${this.baseUrl}/${id}`, trip);
    return response.data;
  }

  async deleteTrip(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async updateTripStatus(id: number, status: TripStatus): Promise<Trip> {
    const response = await apiClient.patch<Trip>(`${this.baseUrl}/${id}/status`, { status });
    return response.data;
  }

  async cancelTrip(id: number, reason: string): Promise<Trip> {
    const response = await apiClient.post<Trip>(`${this.baseUrl}/${id}/cancel`, { reason });
    return response.data;
  }

  async assignStudents(tripId: number, studentIds: number[]): Promise<Trip> {
    const response = await apiClient.post<Trip>(`${this.baseUrl}/${tripId}/students`, { studentIds });
    return response.data;
  }
} 