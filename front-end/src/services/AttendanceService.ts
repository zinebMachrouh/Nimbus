import { Attendance, AttendanceStatus } from '../core/entities/attendance.entity';

export interface AttendanceService {
  getAllAttendance(): Promise<Attendance[]>;
  getAttendanceById(id: number): Promise<Attendance>;
  getAttendanceWithDetails(id: number): Promise<Attendance>;
  findByStudentId(studentId: number): Promise<Attendance[]>;
  findByTripId(tripId: number): Promise<Attendance[]>;
  findStudentAttendanceInPeriod(studentId: number, start: string, end: string): Promise<Attendance[]>;
  findByTripAndStatus(tripId: number, status: AttendanceStatus): Promise<Attendance[]>;
  findUnnotifiedAttendance(cutoffTime: string): Promise<Attendance[]>;
  countTodaysPresentAttendance(schoolId: number): Promise<number>;
  findSchoolAttendanceInPeriod(schoolId: number, start: string, end: string): Promise<Attendance[]>;
  findByParentId(parentId: number): Promise<Attendance[]>;
  recordAttendance(attendanceData: {
    studentId: number;
    tripId: number;
    status: AttendanceStatus;
    scanTime?: string;
    notes?: string;
    qrCode?: string;
    schoolId: number;
  }): Promise<Attendance>;
  updateAttendanceStatus(attendanceId: number, status: AttendanceStatus, notes?: string): Promise<void>;
  markAsNotified(attendanceId: number, method: 'SMS' | 'EMAIL' | 'APP'): Promise<void>;
  findAttendanceWithStats(schoolId: number, start: string, end: string): Promise<Attendance[]>;
  getStudentAttendanceStats(studentId: number, start: string, end: string): Promise<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  }>;
  getSchoolAttendanceStats(schoolId: number, start: string, end: string): Promise<{
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
  }>;
  bulkUpdateAttendance(attendances: {
    id: number;
    status: AttendanceStatus;
    notes?: string;
    schoolId: number;
  }[]): Promise<void>;
  getAttendanceReport(schoolId: number, start: string, end: string): Promise<{
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
  }>;
  findAllSchoolAttendance(schoolId: number): Promise<Attendance[]>;
  findSchoolAttendanceInPeriod(schoolId: number, start: string, end: string): Promise<Attendance[]>;
  recordAttendance(request: any): Promise<void>;
  updateAttendanceStatus(attendanceId: number, status: string, notes?: string): Promise<void>;
  markAsNotified(attendanceId: number): Promise<void>;
} 