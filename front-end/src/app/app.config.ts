import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import {authInterceptor} from "./core/interceptors/auth.interceptor";
import {errorInterceptor} from "./core/interceptors/error.interceptor";
import { MatDialogModule } from "@angular/material/dialog"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatTabsModule } from "@angular/material/tabs"
import { MatTableModule } from "@angular/material/table"

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      MatDialogModule,
      MatPaginatorModule,
      MatSortModule,
      MatProgressSpinnerModule,
      MatTabsModule,
      MatTableModule,
    ),
  ]
};
