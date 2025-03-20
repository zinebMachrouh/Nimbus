import { UserRole } from '../entities/user.entity'

export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  licenseNumber?: string; 
  address?: string; 
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
} 