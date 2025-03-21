import type { Vehicle } from "../core/entities/vehicle.entity"
import type { CreateVehicleRequest, UpdateVehicleRequest } from "../core/dto/vehicle.dto"

export interface VehicleService {
  findAll(): Promise<Vehicle[]>
  findById(id: number): Promise<Vehicle>
  create(vehicleRequest: CreateVehicleRequest): Promise<Vehicle>
  update(id: number, vehicleRequest: UpdateVehicleRequest): Promise<Vehicle>
  deleteVehicle(id: number): Promise<void>
  findVehiclesBySchool(schoolId: number): Promise<Vehicle[]>
}

