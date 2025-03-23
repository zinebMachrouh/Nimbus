import { VehicleService } from '../VehicleService';
import { Vehicle } from '../../core/entities/vehicle.entity';
import { CreateVehicleRequest, UpdateVehicleRequest } from '../../core/dto/vehicle.dto';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class VehicleServiceImpl extends BaseHttpService implements VehicleService {
  constructor() {
    super('/v1/vehicles');
  }

  async findAll(): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>();
    return response.data;
  }

  async findById(id: number): Promise<Vehicle> {
    const response = await this.get<ApiResponse<Vehicle>>(`/${id}`);
    return response.data;
  }

  async create(vehicleRequest: CreateVehicleRequest): Promise<Vehicle> {
    // Ensure coordinates are passed correctly to both fields
    if (vehicleRequest.initialLatitude !== undefined && vehicleRequest.initialLatitude !== 0) {
      vehicleRequest.currentLatitude = vehicleRequest.initialLatitude;
    }
    
    if (vehicleRequest.initialLongitude !== undefined && vehicleRequest.initialLongitude !== 0) {
      vehicleRequest.currentLongitude = vehicleRequest.initialLongitude;
    }
    
    const response = await this.post<ApiResponse<Vehicle>>('', vehicleRequest);
    return response.data;
  }

  async addVehicle(formData: any): Promise<Vehicle> {
    const vehicleRequest: CreateVehicleRequest = {
      vehicleNumber: formData.licensePlate,
      make: formData.make,
      model: formData.model,
      year: formData.year,
      capacity: formData.capacity,
      status: formData.status,
      currentMileage: formData.currentMileage,
      insuranceExpiryDate: formData.registrationExpiryDate,
      registrationExpiryDate: formData.registrationExpiryDate,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      schoolId: formData.schoolId,
      initialLatitude: formData.currentLatitude,
      initialLongitude: formData.currentLongitude
    };
    
    return this.create(vehicleRequest);
  }

  async update(id: number, vehicleRequest: UpdateVehicleRequest): Promise<Vehicle> {
    // If there are latitude/longitude properties, map them to initialLatitude/initialLongitude as well
    if (vehicleRequest.currentLatitude !== undefined || vehicleRequest.currentLongitude !== undefined) {
      vehicleRequest = {
        ...vehicleRequest,
        initialLatitude: vehicleRequest.currentLatitude,
        initialLongitude: vehicleRequest.currentLongitude
      };
    }
    
    const response = await this.put<ApiResponse<Vehicle>>(`/${id}`, vehicleRequest);
    return response.data;
  }

  async deleteVehicle(id: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${id}`);
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle> {
    const response = await this.get<ApiResponse<Vehicle>>(`/license-plate/${encodeURIComponent(licensePlate)}`);
    return response.data;
  }

  async findAvailableVehicles(): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>('/available');
    return response.data;
  }

  async findVehiclesBySchool(schoolId: number): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>(`/school/${schoolId}`);
    return response.data;
  }

  async findNearbyVehicles(latitude: number, longitude: number, radiusInMeters: number): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>(
      `/nearby?latitude=${latitude}&longitude=${longitude}&radiusInMeters=${radiusInMeters}`
    );
    return response.data;
  }

  async findActivelyOperatingVehicles(): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>('/operating');
    return response.data;
  }

  async countCompletedTrips(id: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/${id}/trips/count`);
    return response.data;
  }

  async updateLocation(id: number, latitude: number, longitude: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${id}/location?latitude=${latitude}&longitude=${longitude}`);
  }

  async markAsAvailable(id: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${id}/available`);
  }

  async markAsUnavailable(id: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${id}/unavailable`);
  }

  async assignToSchool(id: number, schoolId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${id}/assign-school/${schoolId}`);
  }

  async removeFromSchool(id: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${id}/remove-school`);
  }

  async performMaintenance(id: number, maintenanceType: string, notes: string): Promise<void> {
    await this.post<ApiResponse<void>>(
      `/${id}/maintenance?maintenanceType=${encodeURIComponent(maintenanceType)}&notes=${encodeURIComponent(notes)}`
    );
  }

  async completeMaintenance(id: number, notes: string): Promise<void> {
    await this.post<ApiResponse<void>>(`/${id}/maintenance/complete?notes=${encodeURIComponent(notes)}`);
  }

  async findVehiclesWithStats(): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>('/with-stats');
    return response.data;
  }
}