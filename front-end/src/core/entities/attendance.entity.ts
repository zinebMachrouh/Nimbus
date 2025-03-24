import { Student } from './student.entity';
import { Trip } from './trip.entity';

export enum AttendanceStatus {
  PENDING = 'PENDING',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  ABSENT_NOTIFIED = 'ABSENT_NOTIFIED',
  EXCUSED = 'EXCUSED'
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
} 