import { User } from '../core/entities/user.entity';
import { School } from '../core/entities/school.entity';
import { Driver } from '../core/entities/driver.entity';
import { Student } from '../core/entities/student.entity';
import { Vehicle } from '../core/entities/vehicle.entity';
import { Parent } from '../core/entities/parent.entity';

export interface AdminService {
  getAllUsers(): Promise<User[]>;
  createParent(parentData: any): Promise<User>;
  updateParent(parentId: number, parentData: any): Promise<Parent>;
  deleteParent(parentId: number): Promise<void>;
  toggleParentStatus(parentId: number, isActive: boolean): Promise<Parent>;
  
  createDriver(driverData: any): Promise<Driver>;
  assignDriverToSchool(driverId: number, schoolId: number): Promise<void>;
  deactivateUser(userId: number): Promise<void>;
  activateUser(userId: number): Promise<void>;
  getDashboardStats(): Promise<any>;
  getSystemStatus(): Promise<any>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersWithStats(): Promise<User[]>;
  getSchoolsWithStats(): Promise<School[]>;
  getDriversWithStats(): Promise<Driver[]>;
  getStudentsWithStats(): Promise<Student[]>;
  getVehiclesWithStats(): Promise<Vehicle[]>;
  getAttendanceStats(schoolId: number, start: string, end: string): Promise<any>;
  resetPassword(userId: number, newPassword: string): Promise<void>;
  generateSystemReport(startDate: string, endDate: string): Promise<any>;
  getAuditLogs(page: number, size: number): Promise<any>;
  getAllParents(): Promise<User[]>;
}
