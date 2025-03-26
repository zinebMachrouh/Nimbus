import { School } from './school.entity';
import { Parent } from './parent.entity';
import { Trip } from './trip.entity';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  studentId: string;
  parent: Parent;
  school: School;
  seatNumber: number;
  grade: string;
  qrCode: string;
  attendancePercentage?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  hasTrip?: boolean;
  currentTrip?: Trip;
} 