import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../../environment";

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(private http: HttpClient) {}

  getRouteDetails(routeId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/routes/${routeId}`)
  }

  getTripLocation(tripId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/trips/${tripId}/locations`)
  }

  getStudentAttendance(tripId: number, studentId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/trips/${tripId}/attendances`)
  }
}
