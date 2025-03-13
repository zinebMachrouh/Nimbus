import { Injectable } from "@angular/core"
import type { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http"
import { type Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { MatSnackBar } from "@angular/material/snack-bar"
import { AuthService } from "../../modules/auth/services/auth.service"

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "An unknown error occurred"

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`
        } else {
          if (error.status === 401) {
            this.authService.logout()
            errorMessage = "Your session has expired. Please log in again."
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message
          } else {
            errorMessage = `Error Code: ${error.status}, Message: ${error.message}`
          }
        }

        this.snackBar.open(errorMessage, "Close", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        })

        return throwError(() => error)
      }),
    )
  }
}

