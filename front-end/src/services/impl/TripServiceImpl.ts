import { TripService } from '../TripService';
import { Trip } from '../../core/entities/trip.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class TripServiceImpl extends BaseHttpService implements TripService {
  constructor() {
    super('/v1/trips');
  }

  async getAllTrips(): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>();
    return response.data;
  }

  async getTripById(id: number): Promise<Trip> {
    const response = await this.get<ApiResponse<Trip>>(`/${id}`);
    return response.data;
  }

  async getTripWithDetails(id: number): Promise<Trip> {
    const response = await this.get<ApiResponse<Trip>>(`/${id}/details`);
    return response.data;
  }

  async createTrip(tripData: any): Promise<Trip> {
    const response = await this.post<ApiResponse<Trip>>('', tripData);
    return response.data;
  }

  async deleteTrip(id: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${id}`);
  }

  async findByDriverId(driverId: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/driver/${driverId}`);
    return response.data;
  }

  async findByVehicleId(vehicleId: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/vehicle/${vehicleId}`);
    return response.data;
  }

  async findByRouteId(routeId: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/route/${routeId}`);
    return response.data;
  }

  async findUpcomingTrips(start: string, end: string): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(
      `/upcoming?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async findActiveTrips(): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>('/active');
    return response.data;
  }

  async findUpcomingTripsByDriver(driverId: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/driver/${driverId}/upcoming`);
    return response.data;
  }

  async countActiveTripsForSchool(schoolId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/school/${schoolId}/count`);
    return response.data;
  }

  async assignDriver(tripId: number, driverId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${tripId}/driver/${driverId}`);
  }

  async assignVehicle(tripId: number, vehicleId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${tripId}/vehicle/${vehicleId}`);
  }

  async updateTripStatus(tripId: number, status: string): Promise<void> {
    await this.put<ApiResponse<void>>(`/${tripId}/status?status=${encodeURIComponent(status)}`);
  }

  async updateTripSchedule(tripId: number, departureTime: string, estimatedArrivalTime: string): Promise<void> {
    await this.put<ApiResponse<void>>(
      `/${tripId}/schedule?departureTime=${encodeURIComponent(departureTime)}&estimatedArrivalTime=${encodeURIComponent(estimatedArrivalTime)}`
    );
  }

  async findTripsWithStats(schoolId: number, start: string, end: string): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(
      `/school/${schoolId}/stats?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async startTrip(tripId: number): Promise<void> {
    await this.post<ApiResponse<void>>(`/${tripId}/start`);
  }

  async completeTrip(tripId: number): Promise<void> {
    await this.post<ApiResponse<void>>(`/${tripId}/complete`);
  }

  async cancelTrip(tripId: number, reason: string): Promise<void> {
    await this.post<ApiResponse<void>>(`/${tripId}/cancel?reason=${encodeURIComponent(reason)}`);
  }

  async findByStudentId(studentId: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/student/${studentId}`);
    return response.data;
  }

  async findBySchoolId(schoolId: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/school/${schoolId}`);
    return response.data;
  }

  async findByDateRange(start: string, end: string): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(
      `/date-range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async findByStatus(status: string): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/status/${status}`);
    return response.data;
  }

  async createAndStartTrip(routeId: number): Promise<Trip> {
    const response = await this.post<ApiResponse<Trip>>(`/create-and-start/${routeId}`);
    return response.data;
  }

  async endCurrentTrip(): Promise<Trip> {
    const response = await this.post<ApiResponse<Trip>>('/end-current');
    return response.data;
  }

  async getCurrentTrip(): Promise<Trip> {
    const response = await this.get<ApiResponse<Trip>>('/current');
    return response.data;
  }

  async getTripHistory(page: number, size: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/history?page=${page}&size=${size}`);
    return response.data;
  }

  async findCurrentTripByStudentId(studentId: number): Promise<Trip> {
    const response = await this.get<ApiResponse<Trip>>(`/student/${studentId}/current`);
    return response.data;
  }

  async findTripsByStudentId(studentId: number, page: number, size: number): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/student/${studentId}/history?page=${page}&size=${size}`);
    return response.data;
  }
} 