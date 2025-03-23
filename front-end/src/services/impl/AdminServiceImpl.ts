import { AdminService } from '../AdminService';
import { User } from '../../core/entities/user.entity';
import { School } from '../../core/entities/school.entity';
import { Driver } from '../../core/entities/driver.entity';
import { Student } from '../../core/entities/student.entity';
import { Vehicle } from '../../core/entities/vehicle.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';
import { Parent } from '../../core/entities/parent.entity';

export class AdminServiceImpl extends BaseHttpService implements AdminService {
  constructor() {
    super('/v1/admin');
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.get<ApiResponse<User[]>>('/users');
    return response.data;
  }

  async createParent(parentData: any): Promise<User> {
    // Ensure active status is set for both isActive and active fields
    const requestData = {
      ...parentData,
      isActive: true,
      active: true
    };
    console.log('Creating parent with data:', requestData);
    const response = await this.post<ApiResponse<User>>('/parents', requestData);
    return response.data;
  }

  async updateParent(parentId: number, parentData: any): Promise<Parent> {
    // Ensure active status is set for both isActive and active fields
    const requestData = {
      ...parentData,
      isActive: true,
      active: true
    };
    
    console.log(`Updating parent ${parentId} with data:`, requestData);
    
    // If the parent data has emergency contact info, use the detailed update endpoint
    if (requestData.emergencyContact || requestData.emergencyPhone) {
      const response = await this.patch<ApiResponse<Parent>>(`/parents/${parentId}/update`, requestData);
      return response.data;
    } else {
      const response = await this.patch<ApiResponse<Parent>>(`/parents/${parentId}`, requestData);
      return response.data;
    }
  }

  async deleteParent(parentId: number): Promise<any> {
    console.log(`AdminServiceImpl: Attempting to delete parent with ID: ${parentId}`);
    try {
      // Use the inherited delete method
      const response = await this.delete<ApiResponse<any>>(`/parents/${parentId}`);
      console.log('Parent deletion response:', response);
      return response.data;
    } catch (error: any) {
      console.error(`AdminServiceImpl: Error deleting parent ${parentId}:`, error);
      // Log detailed error information if available
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }

  async toggleParentStatus(parentId: number, isActive: boolean): Promise<Parent> {
    console.log(`AdminServiceImpl: Toggling parent status. ID: ${parentId}, New status: ${isActive}`);
    try {
      // Use this.patch instead of this.client.patch
      const response = await this.patch<ApiResponse<Parent>>(
        `/parents/${parentId}/status?isActive=${isActive}`,
        {} // Empty body
      );
      console.log('Toggle parent status response:', response);
      return response.data;
    } catch (error: any) {
      console.error(`AdminServiceImpl: Error toggling parent ${parentId} status:`, error);
      // Log detailed error information if available
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }

  async createDriver(driverData: any): Promise<Driver> {
    const response = await this.post<ApiResponse<Driver>>('/drivers', driverData);
    return response.data;
  }

  async assignDriverToSchool(driverId: number, schoolId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/drivers/${driverId}/school/${schoolId}`);
  }

  async deactivateUser(userId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/users/${userId}/deactivate`);
  }

  async activateUser(userId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/users/${userId}/activate`);
  }

  async getDashboardStats(): Promise<any> {
    const response = await this.get<ApiResponse<any>>('/dashboard/stats');
    return response.data;
  }

  async getSystemStatus(): Promise<any> {
    const response = await this.get<ApiResponse<any>>('/system/status');
    return response.data;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      // Try the original endpoint first
      const response = await this.get<ApiResponse<User[]>>(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      console.warn(`Error fetching users with role ${role}:`, error);
      
      // If we're looking for drivers or parents specifically, try to fetch from their dedicated endpoints
      if (role === 'DRIVER') {
        try {
          const response = await this.get<ApiResponse<User[]>>('/drivers');
          return response.data;
        } catch (secondError) {
          console.warn(`Error fetching drivers from fallback endpoint:`, secondError);
        }
      } else if (role === 'PARENT') {
        try {
          const response = await this.get<ApiResponse<User[]>>('/parents');
          return response.data;
        } catch (secondError) {
          console.warn(`Error fetching parents from fallback endpoint:`, secondError);
        }
      }
      
      // Return empty array if both attempts fail
      return [];
    }
  }

  async getUsersWithStats(): Promise<User[]> {
    const response = await this.get<ApiResponse<User[]>>('/users/with-stats');
    return response.data;
  }

  async getSchoolsWithStats(): Promise<School[]> {
    const response = await this.get<ApiResponse<School[]>>('/schools/with-stats');
    return response.data;
  }

  async getDriversWithStats(): Promise<Driver[]> {
    const response = await this.get<ApiResponse<Driver[]>>('/drivers/with-stats');
    return response.data;
  }

  async getStudentsWithStats(): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>('/students/with-stats');
    return response.data;
  }

  async getVehiclesWithStats(): Promise<Vehicle[]> {
    const response = await this.get<ApiResponse<Vehicle[]>>('/vehicles/with-stats');
    return response.data;
  }

  async getAttendanceStats(schoolId: number, start: string, end: string): Promise<any> {
    const response = await this.get<ApiResponse<any>>(
      `/attendance/stats?schoolId=${schoolId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    await this.put<ApiResponse<void>>(`/users/${userId}/reset-password`, { newPassword });
  }

  async generateSystemReport(startDate: string, endDate: string): Promise<any> {
    const response = await this.get<ApiResponse<any>>(
      `/reports/system?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
    return response.data;
  }

  async getAuditLogs(page: number, size: number): Promise<any> {
    const response = await this.get<ApiResponse<any>>(`/audit-logs?page=${page}&size=${size}`);
    return response.data;
  }

  async getAllParents(): Promise<User[]> {
    const response = await this.get<ApiResponse<User[]>>('/parents');
    return response.data;
  }
} 