import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../modules/auth/models/User';
import {RouterLink, RouterLinkActive} from "@angular/router";
import { MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import { MatIconModule} from "@angular/material/icon";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {StatCardComponent} from "../../../modules/dashboard/components/stat-card/stat-card.component";
import {TripCardComponent} from "../../../modules/dashboard/components/trip-card/trip-card.component";
import {AdminComponent} from "../../../modules/dashboard/components/admin/admin.component";
import {DriverComponent} from "../../../modules/dashboard/components/driver/driver.component";
import {ParentComponent} from "../../../modules/dashboard/components/parent/parent.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatListModule,
    MatIconModule,
    DatePipe,
    StatCardComponent,
    TripCardComponent,
    NgIf,
    NgForOf,
    AdminComponent,
    DriverComponent,
    ParentComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy{
  currentUser: User | null = null
  isAdmin = false
  isDriver = false
  isParent = false

  private userSub: Subscription | undefined

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      console.log(user)
      this.currentUser = user
      this.isAdmin = this.authService.hasRole("ADMIN")
      this.isDriver = this.authService.hasRole("DRIVER")
      this.isParent = this.authService.hasRole("PARENT")
    })
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe()
    }
  }

  logout() {
    this.authService.logout()
  }

  getCurrentDate(): string {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day}${this.getOrdinalSuffix(day)} ${month} ${year}`;
  }

  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

}
