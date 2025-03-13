import { Routes } from '@angular/router';
import { HomeComponent } from "./shared/components/home/home.component";
import { RegisterComponent } from "./modules/auth/components/register/register.component";
import { DashboardComponent } from "./shared/components/dashboard/dashboard.component";
import { LoginComponent } from './modules/auth/components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/login' }
];
