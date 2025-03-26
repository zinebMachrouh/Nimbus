import { AttendanceService } from '../AttendanceService';
import { Attendance, AttendanceStatus } from '../../core/entities/attendance.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';
import { HttpInterceptor } from "../interceptors/HttpInterceptor";

export class AttendanceServiceImpl extends BaseHttpService implements AttendanceService {
  private readonly baseUrl = '/v1/attendance';
  private readonly http: HttpInterceptor;

  constructor() {
    super('/v1/attendance');
    this.http = new HttpInterceptor();
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
    return this.http.get(`${this.baseUrl}/student/${studentId}`);
  }

  async findByTripId(tripId: number): Promise<Attendance[]> {
    return this.http.get(`${this.baseUrl}/trip/${tripId}`);
  }

  async findStudentAttendanceInPeriod(studentId: number, start: string, end: string): Promise<Attendance[]> {
    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.http.get<ApiResponse<Attendance[]>>(
      `${this.baseUrl}/student/${studentId}/period?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async findByTripAndStatus(tripId: number, status: string): Promise<Attendance[]> {
    return this.http.get(`${this.baseUrl}/trip/${tripId}/status/${status}`);
  }

  async findUnnotifiedAttendance(cutoffTime: string): Promise<Attendance[]> {
    const response = await this.http.get<ApiResponse<Attendance[]>>(`${this.baseUrl}/unnotified?cutoffTime=${encodeURIComponent(cutoffTime)}`);
    return response.data;
  }

  async countTodaysPresentAttendance(schoolId: number): Promise<number> {
    const response = await this.http.get<ApiResponse<number>>(`${this.baseUrl}/school/${schoolId}/present/count`);
    return response.data;
  }

  async findSchoolAttendanceInPeriod(schoolId: number, start: string, end: string): Promise<Attendance[]> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.baseUrl}/school/${schoolId}/period?start=${start}&end=${end}`);
  }

  async findByParentId(parentId: number): Promise<Attendance[]> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.baseUrl}/parent/${parentId}`);
  }

  async recordAttendance(request: any): Promise<void> {
    await this.http.post(`${this.baseUrl}/record`, request);
  }

  async updateAttendanceStatus(attendanceId: number, status: string, notes?: string): Promise<void> {
    await this.http.put(`${this.baseUrl}/${attendanceId}/status?status=${status}${notes ? `&notes=${notes}` : ''}`);
  }

  async markAsNotified(attendanceId: number): Promise<void> {
    await this.http.put(`${this.baseUrl}/${attendanceId}/mark-notified`);
  }

  async findAttendanceWithStats(schoolId: number, start: string, end: string): Promise<Attendance[]> {
    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.http.get<ApiResponse<Attendance[]>>(
      `/school/${schoolId}/stats?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async getStudentAttendanceStats(studentId: number, start: string, end: string): Promise<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  }> {
    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.http.get<ApiResponse<any>>(
      `/student/${studentId}/stats?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async getSchoolAttendanceStats(schoolId: number, start: string, end: string): Promise<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
    byGrade: Record<string, {
      total: number;
      present: number;
      percentage: number;
    }>;
  }> {
    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.http.get<ApiResponse<any>>(
      `/school/${schoolId}/stats?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async bulkUpdateAttendance(attendances: {
    id: number;
    status: AttendanceStatus;
    notes?: string;
  }[]): Promise<void> {
    await this.http.put<ApiResponse<void>>('/bulk-update', { attendances });
  }

  async getAttendanceReport(schoolId: number, start: string, end: string): Promise<{
    dailyStats: Array<{
      date: string;
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      percentage: number;
    }>;
    gradeStats: Array<{
      grade: string;
      total: number;
      present: number;
      percentage: number;
    }>;
    routeStats: Array<{
      routeId: number;
      routeName: string;
      total: number;
      present: number;
      percentage: number;
    }>;
  }> {
    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.http.get<ApiResponse<any>>(
      `/school/${schoolId}/report?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async findAllSchoolAttendance(schoolId: number): Promise<Attendance[]> {
    try {
      const response = await this.http.get<ApiResponse<Attendance[]>>(`${this.baseUrl}/school/${schoolId}/all`);
      console.log('Raw response:', response);
      if (!response || !response.data) {
        console.warn('No data received from findAllSchoolAttendance');
        return [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error in findAllSchoolAttendance:', error);
      return [];
    }
  }
} 