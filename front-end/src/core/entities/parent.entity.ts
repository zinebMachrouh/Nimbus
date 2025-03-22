import { User } from './user.entity';
import { Student } from './student.entity';

export interface Parent extends User {
  students?: Student[];
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
} 