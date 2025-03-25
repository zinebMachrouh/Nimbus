import { AttendanceService } from '../AttendanceService';
import { Attendance, AttendanceStatus } from '../../core/entities/attendance.entity';
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
    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.get<ApiResponse<Attendance[]>>(
      `/student/${studentId}/period?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async findByTripAndStatus(tripId: number, status: AttendanceStatus): Promise<Attendance[]> {
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
    // Validate dates
    const today = new Date().toISOString().split('T')[0];
    if (end > today) {
      throw new Error('End date cannot be in the future');
    }

    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.get<ApiResponse<Attendance[]>>(
      `/school/${schoolId}/period?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async findByParentId(parentId: number): Promise<Attendance[]> {
    const response = await this.get<ApiResponse<Attendance[]>>(`/parent/${parentId}`);
    return response.data;
  }

  async recordAttendance(attendanceData: {
    studentId: number;
    tripId: number;
    status: AttendanceStatus;
    scanTime?: string;
    notes?: string;
    qrCode?: string;
    schoolId: number;
  }): Promise<Attendance> {
    const response = await this.post<ApiResponse<Attendance>>('/record', attendanceData);
    return response.data;
  }

  async updateAttendanceStatus(attendanceId: number, status: AttendanceStatus, notes?: string): Promise<void> {
    let url = `/${attendanceId}/status?status=${encodeURIComponent(status)}`;
    if (notes) {
      url += `&notes=${encodeURIComponent(notes)}`;
    }
    await this.put<ApiResponse<void>>(url);
  }

  async markAsNotified(attendanceId: number, method: 'SMS' | 'EMAIL' | 'APP'): Promise<void> {
    await this.put<ApiResponse<void>>(`/${attendanceId}/mark-notified?method=${method}`);
  }

  async findAttendanceWithStats(schoolId: number, start: string, end: string): Promise<Attendance[]> {
    // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
    const startDateTime = `${start}T00:00:00`;
    const endDateTime = `${end}T23:59:59`;
    
    const response = await this.get<ApiResponse<Attendance[]>>(
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
    
    const response = await this.get<ApiResponse<any>>(
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
    
    const response = await this.get<ApiResponse<any>>(
      `/school/${schoolId}/stats?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }

  async bulkUpdateAttendance(attendances: {
    id: number;
    status: AttendanceStatus;
    notes?: string;
  }[]): Promise<void> {
    await this.put<ApiResponse<void>>('/bulk-update', { attendances });
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
    
    const response = await this.get<ApiResponse<any>>(
      `/school/${schoolId}/report?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`
    );
    return response.data;
  }
} 