import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../modules/auth/models/User';
import { DashboardService } from '../../../modules/dashboard/services/dashboard.service';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatList, MatListItem} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {StatCardComponent} from "../../../modules/dashboard/components/stat-card/stat-card.component";
import {TripCardComponent} from "../../../modules/dashboard/components/trip-card/trip-card.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatListItem,
    MatList,
    MatIcon,
    DatePipe,
    StatCardComponent,
    TripCardComponent,
    NgIf,
    NgForOf
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy{
  currentUser: User | null = null
  isAdmin = false
  isDriver = false
  isParent = false

  dashboardData: any = null
  isLoading = true
  error: string | null = null

  private userSub: Subscription | undefined

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      this.isAdmin = user?.roles.includes("ROLE_ADMIN") || false
      this.isDriver = user?.roles.includes("ROLE_DRIVER") || false
      this.isParent = user?.roles.includes("ROLE_PARENT") || false

      this.loadDashboardData()
    })
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe()
    }
  }

  loadDashboardData(): void {
    this.isLoading = true
    this.error = null

    if (this.isAdmin) {
      this.loadAdminDashboard()
    } else if (this.isDriver) {
      this.loadDriverDashboard()
    } else if (this.isParent) {
      this.loadParentDashboard()
    }
  }

  loadAdminDashboard(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data
        this.isLoading = false
      },
      error: (err) => {
        this.error = "Failed to load dashboard data. Please try again."
        this.isLoading = false
        console.error(err)
      },
    })
  }

  loadDriverDashboard(): void {
    if (!this.currentUser) return

    this.dashboardService.getDriverDashboard(this.currentUser.id).subscribe({
      next: (data) => {
        this.dashboardData = data
        this.isLoading = false
      },
      error: (err) => {
        this.error = "Failed to load dashboard data. Please try again."
        this.isLoading = false
        console.error(err)
      },
    })
  }

  loadParentDashboard(): void {
    if (!this.currentUser) return

    this.dashboardService.getParentDashboard(this.currentUser.id).subscribe({
      next: (data) => {
        this.dashboardData = data
        this.isLoading = false
      },
      error: (err) => {
        this.error = "Failed to load dashboard data. Please try again."
        this.isLoading = false
        console.error(err)
      },
    })
  }

  logout() {
    this.authService.logout();
  }

}
