import type { BaseDTO } from "./base.dto"

export interface SchoolDTO extends BaseDTO {
  name: string
  address: string
  phoneNumber: string
  latitude?: number
  longitude?: number
}

export interface CreateSchoolRequest {
  name: string
  address: string
  phoneNumber: string
  latitude?: number
  longitude?: number
  // adminId is handled by the backend based on the authenticated user
}

export interface UpdateSchoolRequest {
  name?: string
  address?: string
  phoneNumber?: string
  latitude?: number
  longitude?: number
}

