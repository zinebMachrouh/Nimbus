export interface AuthService {
  isAuthenticated(): boolean;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  // Add other auth methods as needed
}

