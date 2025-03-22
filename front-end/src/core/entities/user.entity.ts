import { BaseEntity } from './base.entity';

export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  DRIVER = 'ROLE_DRIVER',
  PARENT = 'ROLE_PARENT'
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