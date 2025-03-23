import { AuthResponse, RegisterRequest } from '../core/dto/auth.dto';
import { User } from "../core/entities/user.entity";

export interface AuthService {
  isAuthenticated(): boolean;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  getCurrentUser(): Promise<User>;
  hasRole(role: string): boolean;
  getToken(): string;
}

