import { Student } from './student.entity';
import { Trip } from './trip.entity';

export enum AttendanceStatus {
  PENDING = 'PENDING',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  ABSENT_NOTIFIED = 'ABSENT_NOTIFIED'
}

export interface Attendance {
  id: number;
  student: Student;
  trip: Trip;
  status: AttendanceStatus;
  scanTime: string;
  notes?: string;
  parentNotified: boolean;
  seatNumber?: number;
  qrCode?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tripId: number;
  studentId: number;
  schoolId: number;
  parentId: number;
  notificationSentAt?: string;
  notificationMethod?: 'SMS' | 'EMAIL' | 'APP';
  notificationStatus?: 'PENDING' | 'SENT' | 'FAILED';
  notificationError?: string;
} 