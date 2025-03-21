import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { Trip } from './trip.entity';

export enum AttendanceStatus {
  PENDING = 'PENDING',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  ABSENT_NOTIFIED = 'ABSENT_NOTIFIED',
  EXCUSED = 'EXCUSED'
}

export interface AttendanceEntity extends BaseEntity {
  student: Student;
  trip: Trip;
  status: AttendanceStatus;
  scanTime?: Date;
  notes?: string;
  parentNotified?: boolean;
} 