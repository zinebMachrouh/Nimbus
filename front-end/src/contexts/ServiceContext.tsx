import React, { createContext, useContext } from 'react';
import { VehicleService } from '../services/VehicleService';
import { VehicleServiceImpl } from '../services/impl/VehicleServiceImpl';
import { AdminService } from '../services/AdminService';
import { AdminServiceImpl } from '../services/impl/AdminServiceImpl';
import { AuthService } from '../services/AuthService';
import { AuthServiceImpl } from '../services/impl/AuthServiceImpl';
import { SchoolService } from '../services/SchoolService';
import { SchoolServiceImpl } from '../services/impl/SchoolServiceImpl';
import { RouteService } from '../services/RouteService';
import { RouteServiceImpl } from '../services/impl/RouteServiceImpl';
import { StudentService } from '../services/StudentService';
import { StudentServiceImpl } from '../services/impl/StudentServiceImpl';
import { TripService } from '../services/TripService';
import { TripServiceImpl } from '../services/impl/TripServiceImpl';
import { AttendanceService } from '../services/AttendanceService';
import { AttendanceServiceImpl } from '../services/impl/AttendanceServiceImpl';
import { ParentService } from '../services/ParentService';
import { ParentServiceImpl } from '../services/impl/ParentServiceImpl';
import { DriverService } from '../services/DriverService';
import { DriverServiceImpl } from '../services/impl/DriverServiceImpl';

interface ServiceContextType {
  vehicleService: VehicleService;
  adminService: AdminService;
  authService: AuthService;
  schoolService: SchoolService;
  routeService: RouteService;
  studentService: StudentService;
  tripService: TripService;
  attendanceService: AttendanceService;
  parentService: ParentService;
  driverService: DriverService;
}

const vehicleService = new VehicleServiceImpl();
const adminService = new AdminServiceImpl();
const authService = new AuthServiceImpl();
const schoolService = new SchoolServiceImpl();
const routeService = new RouteServiceImpl();
const studentService = new StudentServiceImpl();
const tripService = new TripServiceImpl();
const attendanceService = new AttendanceServiceImpl();
const parentService = new ParentServiceImpl();
const driverService = new DriverServiceImpl();

const ServiceContext = createContext<ServiceContextType>({
  vehicleService,
  adminService,
  authService,
  schoolService,
  routeService,
  studentService,
  tripService,
  attendanceService,
  parentService,
  driverService,
});

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ServiceContext.Provider
      value={{
        vehicleService,
        adminService,
        authService,
        schoolService,
        routeService,
        studentService,
        tripService,
        attendanceService,
        parentService,
        driverService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => useContext(ServiceContext);

// Export individual service hooks for convenience
export const useVehicleService = () => useContext(ServiceContext).vehicleService;
export const useAdminService = () => useContext(ServiceContext).adminService;
export const useAuthService = () => useContext(ServiceContext).authService;
export const useSchoolService = () => useContext(ServiceContext).schoolService;
export const useRouteService = () => useContext(ServiceContext).routeService;
export const useStudentService = () => useContext(ServiceContext).studentService;
export const useTripService = () => useContext(ServiceContext).tripService;
export const useAttendanceService = () => useContext(ServiceContext).attendanceService;
export const useParentService = () => useContext(ServiceContext).parentService;
export const useDriverService = () => useContext(ServiceContext).driverService;
