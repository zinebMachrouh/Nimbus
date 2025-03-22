import type { BaseDTO } from "./base.dto"
import { VehicleStatus } from "../entities/vehicle.entity"

export interface VehicleDTO extends BaseDTO {
  vehicleNumber: string
  make: string
  model: string
  year: number
  capacity: number
  status: VehicleStatus
  currentMileage: number
  insuranceExpiryDate: string
  registrationExpiryDate: string
  lastMaintenanceDate: string
  trackingDeviceId?: string
  currentLatitude?: number
  currentLongitude?: number
}

export interface CreateVehicleRequest {
  vehicleNumber: string
  make: string
  model: string
  year: number
  capacity: number
  status: VehicleStatus
  currentMileage: number
  insuranceExpiryDate: string
  registrationExpiryDate: string
  lastMaintenanceDate: string
  trackingDeviceId?: string
  currentLatitude?: number
  currentLongitude?: number
  initialLatitude?: number
  initialLongitude?: number
  schoolId?: number
}

export interface UpdateVehicleRequest {
  vehicleNumber?: string
  make?: string
  model?: string
  year?: number
  capacity?: number
  status?: VehicleStatus
  currentMileage?: number
  insuranceExpiryDate?: string
  registrationExpiryDate?: string
  lastMaintenanceDate?: string
  trackingDeviceId?: string
  currentLatitude?: number
  currentLongitude?: number
  initialLatitude?: number
  initialLongitude?: number
} 