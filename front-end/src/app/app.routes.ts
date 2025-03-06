import { Routes } from '@angular/router';
import {HomeComponent} from "./shared/components/home/home.component";
import {RegisterComponent} from "./modules/auth/components/register/register.component";
import {LoginComponent} from "./modules/auth/components/login/login.component";
import {DriverDashboardComponent} from "./modules/driver/components/driver-dashboard/driver-dashboard.component";

export const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'driver', component: DriverDashboardComponent}
];
