import { Routes } from '@angular/router';
import { HomeComponent } from "./shared/components/home/home.component";
import { RegisterComponent } from "./modules/auth/components/register/register.component";
import { DashboardComponent } from "./shared/components/dashboard/dashboard.component";
import { LoginComponent } from './modules/auth/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent , canActivate: [AuthGuard]},
  /*
  { path: "trips/:id", component: TripDetailsComponent, canActivate: [authGuard] },
  { path: "notifications", component: NotificationListComponent, canActivate: [authGuard] },
  { path: "reports", component: ReportGeneratorComponent, canActivate: [authGuard] },
   */
  { path: '**', redirectTo: '/login' }
];
