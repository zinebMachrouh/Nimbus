import { Student } from './student.entity';
import { Trip } from './trip.entity';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export interface Attendance {
  id: number;
  student: Student;
  trip: Trip;
  status: AttendanceStatus;
  scanTime: string;
  notes?: string;
  notified: boolean;
  notificationTime?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
} 