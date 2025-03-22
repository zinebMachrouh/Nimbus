import { AdminService } from '../AdminService';
import { User } from '../../core/entities/user.entity';
import { School } from '../../core/entities/school.entity';
import { Driver } from '../../core/entities/driver.entity';
import { Student } from '../../core/entities/student.entity';
import { Vehicle } from '../../core/entities/vehicle.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class AdminServiceImpl extends BaseHttpService implements AdminService {
  constructor() {
    super('/v1/admin');
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.get<ApiResponse<User[]>>('/users');
    return response.data;
  }

  async createParent(parentData: any): Promise<User> {
    const response = await this.post<ApiResponse<User>>('/parents', parentData);
    return response.data;
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
    const response = await this.get<ApiResponse<User[]>>(`/users/role/${role}`);
    return response.data;
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
} 