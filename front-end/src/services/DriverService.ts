import { Driver } from '../core/entities/driver.entity';
import { Vehicle } from '../core/entities/vehicle.entity';
import { Trip } from '../core/entities/trip.entity';
import { Student } from '../core/entities/student.entity';

export interface DriverService {
  /**
   * Get all drivers for a specific school
   * @param schoolId The ID of the school
   * @returns Promise of array of Driver objects
   */
  getAllDriversBySchoolId(schoolId: number): Promise<Driver[]>;
  
  /**
   * Get details for the currently logged in driver
   * @returns Promise of a Driver object
   */
  getDriverDetails(): Promise<Driver>;
  
  /**
   * Get a specific driver by ID
   * @param driverId The ID of the driver
   * @returns Promise of a Driver object
   */
  getDriverById(driverId: number): Promise<Driver>;
  
  /**
   * Create a new driver
   * @param driver The driver object to create
   * @returns Promise of the created Driver object
   */
  createDriver(driver: Partial<Driver>): Promise<Driver>;
  
  /**
   * Update an existing driver
   * @param driverId The ID of the driver to update
   * @param driver The updated driver data
   * @returns Promise of the updated Driver object
   */
  updateDriver(driverId: number, driver: Partial<Driver>): Promise<Driver>;
  
  /**
   * Delete a driver
   * @param driverId The ID of the driver to delete
   * @returns Promise resolving when the driver is deleted
   */
  deleteDriver(driverId: number): Promise<void>;
  
  /**
   * Activate or deactivate a driver
   * @param driverId The ID of the driver
   * @param isActive Whether the driver should be active
   * @returns Promise of the updated Driver object
   */
  toggleDriverStatus(driverId: number, isActive: boolean): Promise<Driver>;
  
  /**
   * Get assigned vehicles for the currently logged in driver
   * @returns Promise of array of Vehicle objects
   */
  getAssignedVehicles(): Promise<Vehicle[]>;
  
  /**
   * Get the active route for the currently logged in driver
   * @returns Promise of any object containing route details
   */
  getActiveRoute(): Promise<any>;
  
  /**
   * Start a new trip
   * @param vehicleId The ID of the vehicle
   * @param routeId The ID of the route
   * @returns Promise of a Trip object
   */
  startTrip(vehicleId: number, routeId: number): Promise<Trip>;
  
  /**
   * End the current trip
   * @param tripId The ID of the trip to end
   * @returns Promise resolving when the trip is ended
   */
  endTrip(tripId: number): Promise<void>;
  
  /**
   * Record student attendance for a trip
   * @param tripId The ID of the trip
   * @param studentId The ID of the student
   * @param status The attendance status (PRESENT, ABSENT)
   * @param timestamp The timestamp of the attendance record
   * @returns Promise resolving when attendance is recorded
   */
  recordAttendance(tripId: number, studentId: number, status: string, timestamp: string): Promise<void>;
  
  /**
   * Update the driver's location
   * @param latitude The latitude coordinate
   * @param longitude The longitude coordinate
   * @returns Promise resolving when location is updated
   */
  updateLocation(latitude: number, longitude: number): Promise<void>;
  
  /**
   * Get students assigned to the current route
   * @returns Promise of array of Student objects
   */
  getRouteStudents(): Promise<Student[]>;
  
  /**
   * Get trip history for the currently logged in driver
   * @param page The page number for pagination
   * @param size The page size for pagination
   * @returns Promise of array of Trip objects
   */
  getTripHistory(page?: number, size?: number): Promise<Trip[]>;
  
  /**
   * Update the driver's profile
   * @param data Object containing phoneNumber and/or address
   * @returns Promise resolving when update is complete
   */
  updateProfile(data: { phoneNumber?: string; address?: string }): Promise<void>;
  
  /**
   * Change the driver's password
   * @param currentPassword The current password
   * @param newPassword The new password
   * @returns Promise resolving when password change is complete
   */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
} 