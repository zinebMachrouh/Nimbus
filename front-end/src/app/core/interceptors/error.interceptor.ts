import type { HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { catchError } from "rxjs/operators"
import { throwError } from "rxjs"
import { MatSnackBar } from "@angular/material/snack-bar"
import { AuthService } from "../../modules/auth/services/auth.service"

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService)
  const snackBar = inject(MatSnackBar)

  return next(request).pipe(
    catchError((error) => {
      let errorMessage = "An unknown error occurred"

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`
      } else {
        if (error.status === 401) {
          authService.logout()
          errorMessage = "Your session has expired. Please log in again."
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message
        } else {
          errorMessage = `Error Code: ${error.status}, Message: ${error.message}`
        }
      }

      snackBar.open(errorMessage, "Close", {
        duration: 5000,
        horizontalPosition: "center",
        verticalPosition: "bottom",
      })

      return throwError(() => error)
    }),
  )
}

