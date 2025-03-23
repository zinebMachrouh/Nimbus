import { Student } from '../core/entities/student.entity';
import { Trip } from '../core/entities/trip.entity';
import { Attendance } from '../core/entities/attendance.entity';
import { Parent } from '../core/entities/parent.entity';

export interface ParentService {
  findAll(): Promise<Parent[]>;
  /**
   * Get all parents in a school by school ID
   * @param schoolId The ID of the school
   * @returns Promise of Student array with parent information
   */
  getAllParentsBySchoolId(schoolId: number): Promise<Parent[]>;
  
  /**
   * Get a specific parent by ID
   * @param parentId The ID of the parent
   * @returns Promise of a Parent object
   */
  getParentById(parentId: number): Promise<Parent>;
  
  /**
   * Create a new parent
   * @param parent The parent object to create
   * @returns Promise of the created Parent object
   */
  createParent(parent: Partial<Parent>): Promise<Parent>;
  
  /**
   * Update an existing parent
   * @param parentId The ID of the parent to update
   * @param parent The updated parent data
   * @returns Promise of the updated Parent object
   */
  updateParent(parentId: number, parent: Partial<Parent>): Promise<Parent>;
  
  /**
   * Delete a parent
   * @param parentId The ID of the parent to delete
   * @returns Promise resolving when the parent is deleted
   */
  deleteParent(parentId: number): Promise<void>;
  
  /**
   * Activate or deactivate a parent
   * @param parentId The ID of the parent
   * @param isActive Whether the parent should be active
   * @returns Promise of the updated Parent object
   */
  toggleParentStatus(parentId: number, isActive: boolean): Promise<Parent>;

  /**
   * Get children for the currently logged in parent
   * @returns Promise of array of Student objects
   */
  getChildren(): Promise<Student[]>;
  
  /**
   * Get details of a specific child
   * @param childId The ID of the child (student)
   * @returns Promise of a Student object
   */
  getChildDetails(childId: number): Promise<Student>;
  
  /**
   * Get the current trip for a child
   * @param childId The ID of the child (student)
   * @returns Promise of a Trip object
   */
  getChildCurrentTrip(childId: number): Promise<Trip>;
  
  /**
   * Get trip history for a child
   * @param childId The ID of the child (student)
   * @param page The page number for pagination
   * @param size The page size for pagination
   * @returns Promise of array of Trip objects
   */
  getChildTripHistory(childId: number, page?: number, size?: number): Promise<Trip[]>;
  
  /**
   * Get attendance records for a child
   * @param childId The ID of the child (student)
   * @param start Start date for filtering
   * @param end End date for filtering
   * @returns Promise of array of Attendance objects
   */
  getChildAttendance(childId: number, start: string, end: string): Promise<Attendance[]>;
  
  /**
   * Get attendance statistics for a child
   * @param childId The ID of the child (student)
   * @param start Start date for filtering
   * @param end End date for filtering
   * @returns Promise of attendance statistics
   */
  getChildAttendanceStats(childId: number, start: string, end: string): Promise<any>;
  
  /**
   * Update the parent's profile
   * @param data Object containing phoneNumber and/or address
   * @returns Promise resolving when update is complete
   */
  updateProfile(data: { phoneNumber?: string; address?: string }): Promise<void>;
  
  /**
   * Change the parent's password
   * @param currentPassword The current password
   * @param newPassword The new password
   * @returns Promise resolving when password change is complete
   */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
} 