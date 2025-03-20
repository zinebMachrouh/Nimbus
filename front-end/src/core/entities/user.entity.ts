import { BaseEntity } from './base.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PARENT = 'PARENT'
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
} 