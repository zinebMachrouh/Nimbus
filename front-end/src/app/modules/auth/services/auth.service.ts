import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, Subscription, throwError} from 'rxjs';
import { tap } from 'rxjs/operators';
import {Router} from "@angular/router";
import {User} from "../models/User";
import {JwtResponse} from "../models/jwt-response";
import {environment} from "../../../../../environment";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  private tokenExpirationTimer: any

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(username: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${environment.apiUrl}/api/auth/signin`, { username, password }).pipe(
      tap((response) => {
        this.handleAuthentication(
          response.id,
          response.username,
          response.email,
          response.fullName,
          response.roles,
          response.token,
          +response.type,
        )
      }),
      catchError((error) => {
        return throwError(() => error)
      }),
    )
  }

  register(
    username: string,
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    address: string,
    roles: string[],
  ): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/signup`, {
      username,
      email,
      password,
      fullName,
      phoneNumber,
      address,
      roles,
    })
  }

  logout(): void {
    this.currentUserSubject.next(null)
    localStorage.removeItem("userData")
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer)
    }
    this.tokenExpirationTimer = null
    this.router.navigate(["/auth/login"])
  }

  autoLogin(): void {
    const userData = localStorage.getItem("userData")
    if (!userData) {
      return
    }

    const parsedUser: {
      id: number
      username: string
      email: string
      fullName: string
      phoneNumber: string
      address: string
      roles: string[]
      _token: string
      _tokenExpirationDate: string
    } = JSON.parse(userData)

    const loadedUser = new User(
      parsedUser.id,
      parsedUser.username,
      parsedUser.email,
      parsedUser.fullName,
      parsedUser.roles,
      parsedUser._token,
      new Date(parsedUser._tokenExpirationDate),
      parsedUser.phoneNumber,
      parsedUser.address,
    )

    if (loadedUser.token) {
      this.currentUserSubject.next(loadedUser)
      const expirationDuration = new Date(parsedUser._tokenExpirationDate).getTime() - new Date().getTime()
      this.autoLogout(expirationDuration)
    }
  }

  autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout()
    }, expirationDuration)
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token || null
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.roles.includes(role) || false
  }

  private handleAuthentication(
    id: number,
    username: string,
    email: string,
    fullName: string,
    roles: string[],
    token: string,
    expiresIn: number,
  ): void {
    const expirationDate = new Date(new Date().getTime() + expiresIn)
    const user = new User(id, username, email, fullName, roles, token, expirationDate)
    this.currentUserSubject.next(user)
    this.autoLogout(expiresIn)
    localStorage.setItem("userData", JSON.stringify(user))
  }
}

