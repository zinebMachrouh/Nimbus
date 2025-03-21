import { BaseEntity } from './base.entity';
import { School } from './school.entity';
import { Parent } from './parent.entity';

export interface Student extends BaseEntity {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  studentId: string;
  parent: Parent;
  school: School;
  seatNumber: number;
  qrCode?: string;
  attendancePercentage?: number;
} 