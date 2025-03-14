import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, catchError, type Observable, throwError } from "rxjs"
import { tap } from "rxjs/operators"
import { Router } from "@angular/router"
import { User } from "../models/User"
import { JwtResponse } from "../models/jwt-response"
import { environment } from "../../../../../environment"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  private tokenExpirationTimer: any

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(username: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${environment.apiUrl}/api/auth/signin`, { username, password }).pipe(
      tap((response) => {
        if (response.token) {
          console.log("response:", response)
          this.handleAuthentication(
            response.id,
            response.username,
            response.email,
            response.fullName,
            response.roles,
            response.token,
            response.phoneNumber,
            response.address,
          )
        } else {
          throw new Error("No token received from server")
        }
      }),
      catchError((error) => {
        console.error("Login error:", error)
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
    return this.http
      .post(`${environment.apiUrl}/api/auth/signup`, {
        username,
        email,
        password,
        fullName,
        phoneNumber,
        address,
        roles,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error)
        }),
      )
  }

  logout(): void {
    this.currentUserSubject.next(null)
    localStorage.removeItem("userData")
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer)
    }
    this.tokenExpirationTimer = null
    this.router.navigate(["/login"])
  }

  autoLogin(): void {
    const userData = localStorage.getItem("userData")
    if (!userData) {
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      const expirationDate = new Date(parsedUser._tokenExpirationDate)

      if (expirationDate > new Date()) {
        const loadedUser = new User(
          parsedUser.id,
          parsedUser.username,
          parsedUser.email,
          parsedUser.fullName,
          parsedUser.roles,
          parsedUser._token,
          expirationDate,
          parsedUser.phoneNumber,
          parsedUser.address,
        )

        if (loadedUser.token) {
          this.currentUserSubject.next(loadedUser)

          // Reset the expiration timer
          const expirationTime = expirationDate.getTime() - new Date().getTime()
          if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer)
          }
          this.tokenExpirationTimer = setTimeout(() => {
            this.logout()
          }, expirationTime)
        }
      } else {
        // Token has expired, clear storage
        this.logout()
      }
    } catch (error) {
      console.error("Error during auto-login:", error)
      this.logout()
    }
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value
    if (!user) {
      const userData = localStorage.getItem("userData")
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          const expirationDate = new Date(parsedUser._tokenExpirationDate)
          if (expirationDate > new Date()) {
            const loadedUser = new User(
              parsedUser.id,
              parsedUser.username,
              parsedUser.email,
              parsedUser.fullName,
              parsedUser.roles,
              parsedUser._token,
              expirationDate,
              parsedUser.phoneNumber,
              parsedUser.address,
            )
            return loadedUser.token
          } else {
            this.logout()
            return null
          }
        } catch (error) {
          console.error("Error parsing user data:", error)
          this.logout()
          return null
        }
      }
      return null
    }
    return user.token
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value
    if (!user) return false
    return user.roles.some((r) => r === `ROLE_${role.toUpperCase()}`)
  }

  private handleAuthentication(
    id: number,
    username: string,
    email: string,
    fullName: string,
    roles: string[],
    token: string,
    phoneNumber?: string,
    address?: string,
  ): void {
    if (!token) {
      console.error("No token received during authentication")
      return
    }

    const expirationDate = new Date()
    expirationDate.setHours(expirationDate.getHours() + 24)

    console.log(fullName);
    const user = new User(id, username, email, fullName, roles, token, expirationDate, phoneNumber, address)

    this.currentUserSubject.next(user)
    localStorage.setItem("userData", JSON.stringify(user))

    const expirationTime = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer)
    }
    this.tokenExpirationTimer = setTimeout(() => {
      console.log("Token expired, logging out...")
      this.logout()
    }, expirationTime)
  }
}

