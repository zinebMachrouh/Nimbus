import { Trip } from '../core/entities/trip.entity';

export interface TripService {
  getAllTrips(): Promise<Trip[]>;
  getTripById(id: number): Promise<Trip>;
  getTripWithDetails(id: number): Promise<Trip>;
  createTrip(tripData: any): Promise<Trip>;
  deleteTrip(id: number): Promise<void>;
  findByDriverId(driverId: number): Promise<Trip[]>;
  findByVehicleId(vehicleId: number): Promise<Trip[]>;
  findByRouteId(routeId: number): Promise<Trip[]>;
  findUpcomingTrips(start: string, end: string): Promise<Trip[]>;
  findActiveTrips(): Promise<Trip[]>;
  findUpcomingTripsByDriver(driverId: number): Promise<Trip[]>;
  countActiveTripsForSchool(schoolId: number): Promise<number>;
  assignDriver(tripId: number, driverId: number): Promise<void>;
  assignVehicle(tripId: number, vehicleId: number): Promise<void>;
  assignRoute(tripId: number, routeId: number): Promise<void>;
  updateTripStatus(tripId: number, status: string): Promise<void>;
  updateTripSchedule(tripId: number, departureTime: string, estimatedArrivalTime: string): Promise<void>;
  findTripsWithStats(schoolId: number, start: string, end: string): Promise<Trip[]>;
  startTrip(tripId: number): Promise<void>;
  completeTrip(tripId: number): Promise<void>;
  cancelTrip(tripId: number, reason: string): Promise<void>;
  findByStudentId(studentId: number): Promise<Trip[]>;
  findBySchoolId(schoolId: number): Promise<Trip[]>;
  findByDateRange(start: string, end: string): Promise<Trip[]>;
  findByStatus(status: string): Promise<Trip[]>;
  createAndStartTrip(routeId: number): Promise<Trip>;
  endCurrentTrip(): Promise<Trip>;
  getCurrentTrip(): Promise<Trip>;
  getTripHistory(page: number, size: number): Promise<Trip[]>;
  findCurrentTripByStudentId(studentId: number): Promise<Trip>;
  findTripsByStudentId(studentId: number, page: number, size: number): Promise<Trip[]>;
  assignStudents(tripId: number, studentIds: number[]): Promise<Trip>;
  getTripRequestSchema(): Promise<any>;
} 