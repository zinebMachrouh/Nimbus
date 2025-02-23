import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8085/api/v1/auth';
  private jwtTokenKey = 'authToken';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  login(loginRequest: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, loginRequest).pipe(
      tap((response: any) => {
        const token = response.token;
        const user = response.username;
        if (token) {
          this.storeToken(token);
          this.decodeAndSetUser(token);
          this.setUsername(user);
        }
      })
    );
  }

  logout(): void {
    this.clearToken();
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.jwtTokenKey);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.jwtTokenKey, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.jwtTokenKey);
  }

  private decodeAndSetUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserSubject.next(payload);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.clearToken();
      this.currentUserSubject.next(null);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      if (expirationDate < new Date()) {
        this.clearToken();
        return false;
      }
      return true;
    } catch {
      this.clearToken();
      return false;
    }
  }

  private setUsername(user: any) {
    localStorage.setItem('username', user);
  }

  public getUsername(): string | null {
    return localStorage.getItem('username');
  }

  public isAdmin(): boolean {
    const user = this.currentUserSubject.getValue();
    if (user && user.roles) {
      return user.roles.some((role: { name: string }) => role.name === 'ADMIN');
    } else {
      return false;
    }
  }
}
