import { AttendanceService } from '../AttendanceService';
import { Attendance } from '../../core/entities/attendance.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class AttendanceServiceImpl extends BaseHttpService implements AttendanceService {
  constructor() {
    super('/v1/attendance');
  }

  async getAllAttendance(): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>();
    return response.data;
  }

  async getAttendanceById(id: number): Promise<Attendance> {
    const response = await this.get<ApiResponse<Attendance>>(`/${id}`);
    return response.data;
  }

  async getAttendanceWithDetails(id: number): Promise<Attendance> {
    const response = await this.get<ApiResponse<Attendance>>(`/${id}/details`);
    return response.data;
  }

  async findByStudentId(studentId: number): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(`/student/${studentId}`);
    return response.data;
  }

  async findByTripId(tripId: number): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(`/trip/${tripId}`);
    return response.data;
  }

  async findStudentAttendanceInPeriod(studentId: number, start: string, end: string): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(
      `/student/${studentId}/period?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async findByTripAndStatus(tripId: number, status: string): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(`/trip/${tripId}/status/${status}`);
    return response.data;
  }

  async findUnnotifiedAttendance(cutoffTime: string): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(`/unnotified?cutoffTime=${encodeURIComponent(cutoffTime)}`);
    return response.data;
  }

  async countTodaysPresentAttendance(schoolId: number): Promise<number> {
    const response = await this.get<ApiResponse<number>>(`/school/${schoolId}/present/count`);
    return response.data;
  }

  async findSchoolAttendanceInPeriod(schoolId: number, start: string, end: string): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(
      `/school/${schoolId}/period?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async findByParentId(parentId: number): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(`/parent/${parentId}`);
    return response.data;
  }

  async recordAttendance(attendanceData: any): Promise<void> {
    await this.post<ApiResponse<void>>('/record', attendanceData);
  }

  async updateAttendanceStatus(attendanceId: number, status: string, notes?: string): Promise<void> {
    let url = `/${attendanceId}/status?status=${encodeURIComponent(status)}`;
    if (notes) {
      url += `&notes=${encodeURIComponent(notes)}`;
    }
    await this.put<ApiResponse<void>>(url);
  }

  async markAsNotified(attendanceId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${attendanceId}/mark-notified`);
  }

  async findAttendanceWithStats(schoolId: number, start: string, end: string): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(
      `/school/${schoolId}/stats?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }
} 