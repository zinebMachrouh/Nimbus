import type { Vehicle } from "../core/entities/vehicle.entity"
import type { CreateVehicleRequest, UpdateVehicleRequest } from "../core/dto/vehicle.dto"

export interface VehicleService {
  findAll(): Promise<Vehicle[]>
  findById(id: number): Promise<Vehicle>
  create(vehicleRequest: CreateVehicleRequest): Promise<Vehicle>
  update(id: number, vehicleRequest: UpdateVehicleRequest): Promise<Vehicle>
  deleteVehicle(id: number): Promise<void>
  findByLicensePlate(licensePlate: string): Promise<Vehicle>
  findAvailableVehicles(): Promise<Vehicle[]>
  findVehiclesBySchool(schoolId: number): Promise<Vehicle[]>
  findNearbyVehicles(latitude: number, longitude: number, radiusInMeters: number): Promise<Vehicle[]>
  findActivelyOperatingVehicles(): Promise<Vehicle[]>
  countCompletedTrips(id: number): Promise<number>
  updateLocation(id: number, latitude: number, longitude: number): Promise<void>
  markAsAvailable(id: number): Promise<void>
  markAsUnavailable(id: number): Promise<void>
  assignToSchool(id: number, schoolId: number): Promise<void>
  removeFromSchool(id: number): Promise<void>
  performMaintenance(id: number, maintenanceType: string, notes: string): Promise<void>
  completeMaintenance(id: number, notes: string): Promise<void>
  findVehiclesWithStats(): Promise<Vehicle[]>
}

