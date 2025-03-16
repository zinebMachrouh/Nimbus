import { Injectable } from '@angular/core';
import type { Observable } from "rxjs"
import { environment } from '../../../../../environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getAdminDashboard(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/statistics`)
  }

  getDriverDashboard(driverId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/trips/driver/${driverId}/dashboard`)
  }

  getParentDashboard(parentId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/trips/parent/${parentId}/dashboard`)
  }
}
