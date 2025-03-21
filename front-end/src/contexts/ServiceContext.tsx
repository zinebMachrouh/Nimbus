import React from "react"
import { createContext, useContext } from "react"
import { AuthService } from "../services/AuthService"
import { AuthServiceImpl } from "../services/impl/AuthServiceImpl"
import { VehicleService } from "../services/VehicleService"
import { VehicleServiceImpl } from "../services/impl/VehicleServiceImpl"
import {SchoolService} from "../services/SchoolService.ts";
import {SchoolServiceImpl} from "../services/impl/SchoolServiceImpl.ts";

interface ServiceContextType {
  authService: AuthService
  vehicleService: VehicleService
  schoolService: SchoolService
}

const defaultServices: ServiceContextType = {
  authService: new AuthServiceImpl(),
  vehicleService: new VehicleServiceImpl(),
  schoolService: new SchoolServiceImpl(),
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

