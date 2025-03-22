import React from "react"
import { createContext, useContext } from "react"
import { AuthService } from "../services/AuthService"
import { AuthServiceImpl } from "../services/impl/AuthServiceImpl"
import { VehicleService } from "../services/VehicleService"
import { VehicleServiceImpl } from "../services/impl/VehicleServiceImpl"
import { SchoolService } from "../services/SchoolService"
import { SchoolServiceImpl } from "../services/impl/SchoolServiceImpl"
import { StudentService } from "../services/StudentService"
import { StudentServiceImpl } from "../services/impl/StudentServiceImpl"
import { RouteService } from "../services/RouteService"
import { RouteServiceImpl } from "../services/impl/RouteServiceImpl"
import { TripService } from "../services/TripService"
import { TripServiceImpl } from "../services/impl/TripServiceImpl"
import { AttendanceService } from "../services/AttendanceService"
import { AttendanceServiceImpl } from "../services/impl/AttendanceServiceImpl"
import { AdminServiceImpl } from "../services/impl/AdminServiceImpl"
import { AdminService } from "../services/AdminService"

interface ServiceContextType {
  authService: AuthService
  adminService: AdminService
  vehicleService: VehicleService
  schoolService: SchoolService
  studentService: StudentService
  routeService: RouteService
  tripService: TripService
  attendanceService: AttendanceService
}

const defaultServices: ServiceContextType = {
  authService: new AuthServiceImpl(),
  adminService: new AdminServiceImpl(),
  vehicleService: new VehicleServiceImpl(),
  schoolService: new SchoolServiceImpl(),
  studentService: new StudentServiceImpl(),
  routeService: new RouteServiceImpl(),
  tripService: new TripServiceImpl(),
  attendanceService: new AttendanceServiceImpl(),
}

const ServiceContext = createContext<ServiceContextType>(defaultServices)

export const ServiceProvider: React.FC<{
  children: React.ReactNode
  services?: Partial<ServiceContextType>
}> = ({ children, services }) => {
  const value = {
    ...defaultServices,
    ...services,
  }

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
}

export const useServices = () => useContext(ServiceContext)

export const useAuthService = () => useContext(ServiceContext).authService
export const useVehicleService = () => useContext(ServiceContext).vehicleService
export const useSchoolService = () => useContext(ServiceContext).schoolService
export const useStudentService = () => useContext(ServiceContext).studentService
export const useRouteService = () => useContext(ServiceContext).routeService
export const useTripService = () => useContext(ServiceContext).tripService
export const useAttendanceService = () => useContext(ServiceContext).attendanceService
export const useAdminService = () => useContext(ServiceContext).adminService
