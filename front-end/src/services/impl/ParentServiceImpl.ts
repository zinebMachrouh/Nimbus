import { ParentService } from '../ParentService';
import { Student } from '../../core/entities/student.entity';
import { Trip } from '../../core/entities/trip.entity';
import { Attendance } from '../../core/entities/attendance.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';
import { Parent } from '../../core/entities/parent.entity';

export class ParentServiceImpl extends BaseHttpService implements ParentService {
  constructor() {
    super('/v1/parents');
  }

  async findAll(): Promise<Parent[]> {
    const response = await this.get<ApiResponse<Parent[]>>('');
    return response.data;
  }

  async getAllParentsBySchoolId(schoolId: number): Promise<Parent[]> {
    try {
      console.log(`Fetching parents for school ID: ${schoolId}`);
      const response = await this.get<ApiResponse<Parent[]>>(`/school/${schoolId}`);
      
      // Debugging
      console.log('Raw parent response:', response);
      
      if (!response || !response.data) {
        console.warn('No parents found or empty response from API');
        return [];
      }
      
      // The server correctly returns ApiResponse here with student objects that have parent info
      console.log(`Found ${response.data.length} students with parent data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching parents by school ID:', error);
      return [];
    }
  }

  async getParentById(parentId: number): Promise<Parent> {
    const response = await this.get<ApiResponse<Parent>>(`/${parentId}`);
    return response.data;
  }

  async createParent(parent: Partial<Parent>): Promise<Parent> {
    const response = await this.post<ApiResponse<Parent>>('', parent);
    return response.data;
  }

  async updateParent(parentId: number, parent: Partial<Parent>): Promise<Parent> {
    const response = await this.put<ApiResponse<Parent>>(`/${parentId}`, parent);
    return response.data;
  }

  async deleteParent(parentId: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${parentId}`);
  }

  async toggleParentStatus(parentId: number, isActive: boolean): Promise<Parent> {
    const response = await this.put<ApiResponse<Parent>>(`/${parentId}/status`, { isActive });
    return response.data;
  }

  async getChildren(): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>('/children');
    return response.data;
  }

  async getChildDetails(childId: number): Promise<Student> {
    const response = await this.get<ApiResponse<Student>>(`/children/${childId}`);
    return response.data;
  }

  async getChildCurrentTrip(childId: number): Promise<Trip> {
    const response = await this.get<ApiResponse<Trip>>(`/children/${childId}/current-trip`);
    return response.data;
  }

  async getChildTripHistory(childId: number, page: number = 0, size: number = 10): Promise<Trip[]> {
    const response = await this.get<ApiResponse<Trip[]>>(
      `/children/${childId}/trips?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getChildAttendance(childId: number, start: string, end: string): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(
      `/children/${childId}/attendance?start=${start}&end=${end}`
    );
    return response.data;
  }

  async getChildAttendanceStats(childId: number, start: string, end: string): Promise<any> {
    const response = await this.get<ApiResponse<any>>(
      `/children/${childId}/attendance/stats?start=${start}&end=${end}`
    );
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