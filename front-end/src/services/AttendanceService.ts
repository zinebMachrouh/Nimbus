import { Attendance } from '../core/entities/attendance.entity';

export interface AttendanceService {
  getAllAttendance(): Promise<Attendance[]>;
  getAttendanceById(id: number): Promise<Attendance>;
  getAttendanceWithDetails(id: number): Promise<Attendance>;
  findByStudentId(studentId: number): Promise<Attendance[]>;
  findByTripId(tripId: number): Promise<Attendance[]>;
  findStudentAttendanceInPeriod(studentId: number, start: string, end: string): Promise<Attendance[]>;
  findByTripAndStatus(tripId: number, status: string): Promise<Attendance[]>;
  findUnnotifiedAttendance(cutoffTime: string): Promise<Attendance[]>;
  countTodaysPresentAttendance(schoolId: number): Promise<number>;
  findSchoolAttendanceInPeriod(schoolId: number, start: string, end: string): Promise<Attendance[]>;
  findByParentId(parentId: number): Promise<Attendance[]>;
  recordAttendance(attendanceData: any): Promise<void>;
  updateAttendanceStatus(attendanceId: number, status: string, notes?: string): Promise<void>;
  markAsNotified(attendanceId: number): Promise<void>;
  findAttendanceWithStats(schoolId: number, start: string, end: string): Promise<Attendance[]>;
} 