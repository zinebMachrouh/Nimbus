import type { VehicleService } from "../VehicleService"
import type { Vehicle, VehicleStatus } from "../../core/entities/vehicle.entity"
import type { CreateVehicleRequest, UpdateVehicleRequest } from "../../core/dto/vehicle.dto"
import { BaseHttpService } from "../BaseHttpService"

export class VehicleServiceImpl extends BaseHttpService implements VehicleService {
  constructor() {
    super("/v1/admin/vehicles")
  }

  async findAll(): Promise<Vehicle[]> {
    return this.get<Vehicle[]>()
  }

  async findById(id: number): Promise<Vehicle> {
    return this.get<Vehicle>(`/${id}`)
  }

  async create(vehicleRequest: CreateVehicleRequest): Promise<Vehicle> {
    console.log('Creating vehicle with request:', vehicleRequest)
    try {
      const result = await this.post<Vehicle>("", vehicleRequest)
      console.log('Vehicle creation successful:', result)
      return result
    } catch (error) {
      console.error('Error creating vehicle:', error)
      throw error
    }
  }

  async update(id: number, vehicleRequest: UpdateVehicleRequest): Promise<Vehicle> {
    return this.put<Vehicle>(`/${id}`, vehicleRequest)
  }

  async deleteVehicle(id: number): Promise<void> {
    return this.delete<void>(`/${id}`)
  }

  async findVehiclesBySchool(schoolId: number): Promise<Vehicle[]> {
    return this.get<Vehicle[]>(`/school/${schoolId}`)
  }

  async findAvailableVehicles(): Promise<Vehicle[]> {
    return this.get<Vehicle[]>("/available")
  }

  async findVehiclesByStatus(status: VehicleStatus): Promise<Vehicle[]> {
    return this.get<Vehicle[]>(`/status/${status}`)
  }

  async assignDriver(vehicleId: number, driverId: number): Promise<Vehicle> {
    return this.post<Vehicle>(`/${vehicleId}/driver/${driverId}`)
  }

  async removeDriver(vehicleId: number): Promise<Vehicle> {
    return this.delete<Vehicle>(`/${vehicleId}/driver`)
  }

  async scheduleMaintenance(vehicleId: number, date: Date): Promise<Vehicle> {
    return this.post<Vehicle>(`/${vehicleId}/maintenance`, { date })
  }

  async completeMaintenance(vehicleId: number): Promise<Vehicle> {
    return this.post<Vehicle>(`/${vehicleId}/maintenance/complete`)
  }

  async updateVehicleStatus(vehicleId: number, status: VehicleStatus): Promise<Vehicle> {
    return this.patch<Vehicle>(`/${vehicleId}/status`, { status })
  }

  async getVehicleStatistics(vehicleId: number): Promise<{
    totalTrips: number
    totalDistance: number
    averageOccupancy: number
    maintenanceHistory: {
      date: Date
      type: string
      description: string
    }[]
  }> {
    return this.get<any>(`/${vehicleId}/statistics`)
  }

  async getVehicleLocation(vehicleId: number): Promise<{
    latitude: number
    longitude: number
    lastUpdated: Date
  }> {
    return this.get<any>(`/${vehicleId}/location`)
  }
}

