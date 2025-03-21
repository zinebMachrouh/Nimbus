import { User } from './user.entity';
import { Student } from './student.entity';

export interface Parent extends User {
  address: string;
  emergencyContact: string;
} 