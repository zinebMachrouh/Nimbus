import { DriverService } from '../DriverService';
import { Driver, DriverStatus } from '../../core/entities/driver.entity';
import { Vehicle } from '../../core/entities/vehicle.entity';
import { Trip } from '../../core/entities/trip.entity';
import { Student } from '../../core/entities/student.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class DriverServiceImpl extends BaseHttpService implements DriverService {
  constructor() {
    super('/v1/drivers');
  }

  async getAllDriversBySchoolId(schoolId: number): Promise<Driver[]> {
    try {
      console.log(`Fetching drivers for school ${schoolId}`);
      const response = await this.get<Driver[] | ApiResponse<Driver[]>>(`/school/${schoolId}`);
      
      console.log('Raw driver response:', response);
      
      // Handle both direct array and ApiResponse wrapper
      const driversData = Array.isArray(response) ? response : 
                        response.data ? response.data : [];
      
      if (!Array.isArray(driversData)) {
        console.warn('Unexpected response format:', driversData);
        return [];
      }
      
      console.log(`Found ${driversData.length} drivers`);
      
      // Process drivers to ensure status is properly set
      return driversData.map(driver => {
        // Ensure status is always a valid enum string
        if (driver.status === null || driver.status === undefined) {
          console.log(`Driver ${driver.id} has no status, setting to AVAILABLE`);
          driver.status = DriverStatus.AVAILABLE;
        }
        
        // Convert numeric status to string enum if needed
        if (typeof driver.status === 'number') {
          const statusMap: {[key: number]: DriverStatus} = {
            0: DriverStatus.AVAILABLE,
            1: DriverStatus.ON_TRIP,
            2: DriverStatus.OFF_DUTY,
            3: DriverStatus.ON_LEAVE
          };
          console.log(`Converting numeric status ${driver.status} to ${statusMap[driver.status as number]}`);
          driver.status = statusMap[driver.status as number];
        }
        
        return driver;
      });
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.warn('User does not have permission to view drivers for this school');
        return [];
      }
      console.error('Error fetching drivers by school ID:', error);
      throw error;
    }
  }

  async getDriverById(driverId: number): Promise<Driver> {
    const response = await this.get<ApiResponse<Driver>>(`/${driverId}`);
    return response.data;
  }

  async createDriver(driver: Partial<Driver>): Promise<Driver> {
    const response = await this.post<ApiResponse<Driver>>('', driver);
    return response.data;
  }

  async updateDriver(driverId: number, driver: Partial<Driver>): Promise<Driver> {
    const response = await this.put<ApiResponse<Driver>>(`/${driverId}`, driver);
    return response.data;
  }

  async deleteDriver(driverId: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${driverId}`);
  }

  async toggleDriverStatus(driverId: number, isActive: boolean): Promise<Driver> {
    const response = await this.put<ApiResponse<Driver>>(`/${driverId}/status`, { isActive });
    return response.data;
  }

  async getDriverDetails(): Promise<Driver> {
    const response = await this.get<ApiResponse<Driver>>('/profile');
    return response.data;
  }

  async getAssignedVehicles(): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>('/vehicles');
    return response.data;
  }

  async getActiveRoute(): Promise<any> {
    const response = await this.get<ApiResponse<any>>('/active-route');
    return response.data;
  }

  async startTrip(vehicleId: number, routeId: number): Promise<Trip> {
    const response = await this.post<ApiResponse<Trip>>('/trips/start', {
      vehicleId,
      routeId
    });
    return response.data;
  }

  async endTrip(tripId: number): Promise<void> {
    await this.post<ApiResponse<void>>(`/trips/${tripId}/end`);
  }

  async recordAttendance(tripId: number, studentId: number, status: string, timestamp: string): Promise<void> {
    await this.post<ApiResponse<void>>(`/trips/${tripId}/attendance`, {
      studentId,
      status,
      timestamp
    });
  }

  async updateLocation(latitude: number, longitude: number): Promise<void> {
    await this.post<ApiResponse<void>>('/location', {
      latitude,
      longitude
    });
  }

  async getRouteStudents(): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>('/route/students');
    return response.data;
  }

  async getTripHistory(page: number = 0, size: number = 10): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(`/trips?page=${page}&size=${size}`);
    return response.data;
  }

  async updateProfile(data: { phoneNumber?: string; address?: string }): Promise<void> {
    const params = new URLSearchParams();
    if (data.phoneNumber) params.append('phoneNumber', data.phoneNumber);
    if (data.address) params.append('address', data.address);
    
    await this.patch<ApiResponse<void>>(`/profile?${params.toString()}`);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('currentPassword', currentPassword);
    params.append('newPassword', newPassword);
    
    await this.patch<ApiResponse<void>>(`/change-password?${params.toString()}`);
  }
} 