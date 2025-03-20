import { AuthService } from '../AuthService'
import { User, UserRole } from '../../core/entities/user.entity'
import { AuthRequest, AuthResponse, RegisterRequest } from '../../core/dto/auth.dto'
import { BaseHttpService } from '../BaseHttpService'
import { ApiError } from '../../core/models/ApiError'

export class AuthServiceImpl extends BaseHttpService implements AuthService {
    constructor() {
        super('/v1/auth');
    }

    async login(username: string, password: string): Promise<void> {
        try {
            const credentials: AuthRequest = { username, password };
            const authResponse = await this.post<AuthResponse>('/login', credentials);
            this.setTokens(authResponse.token, authResponse);
        } catch (error) {
            if (error instanceof ApiError) {
                console.error(`Login failed: ${error.message}`);
                if (error.validationErrors) {
                    console.error('Validation errors:', error.validationErrors);
                }
            } else {
                console.error('Login failed:', error);
            }
            throw error;
        }
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        return await this.post<AuthResponse>('/register', data);
    }

    async logout(): Promise<void> {
        try {
            await this.post<void>('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearTokens();
        }
    }

    async getCurrentUser(): Promise<User> {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            throw new Error('No user data found');
        }
        return JSON.parse(userData);
    }
    
    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        if (!token) return false;
    
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            return Date.now() < expirationTime;
        } catch {
            return false;
        }
    }

    hasRole(role: string): boolean {
        const userData = localStorage.getItem('currentUser');
        if (!userData) return false;
        
        const user = JSON.parse(userData);
        return user.role === role;
    }
    
    private setTokens(token: string, userData: AuthResponse): void {
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify({
            id: userData.userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role as UserRole,
        }));
    }

    private clearTokens(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }

    getToken(): string {
        return localStorage.getItem('token') || '';
    }
}