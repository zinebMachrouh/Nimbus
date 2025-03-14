import type { HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { catchError } from "rxjs/operators"
import { throwError } from "rxjs"
import { environment } from "../../../../environment"
import { AuthService } from "../../modules/auth/services/auth.service"
import { Router } from "@angular/router"

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const token = authService.getToken()
  const isApiUrl = request.url.startsWith(environment.apiUrl)

  if (token && isApiUrl) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
  }

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.error("Authentication error:", error)
        authService.logout()
        router.navigate(["/login"])
      } else if (error.status === 403) {
        console.error("Authorization error:", error)
        router.navigate(["/unauthorized"])
      }
      return throwError(() => error)
    }),
  )
}
