import type { SchoolService } from "../SchoolService"
import type { School } from "../../core/entities/school.entity"
import type { CreateSchoolRequest, UpdateSchoolRequest } from "../../core/dto/school.dto"
import { BaseHttpService } from "../BaseHttpService"

export class SchoolServiceImpl extends BaseHttpService implements SchoolService {
  constructor() {
    super("/v1/admin/schools")
  }

  async findAll(): Promise<School[]> {
    return this.get<School[]>()
  }

  async findById(id: number): Promise<School> {
    return this.get<School>(`/${id}`)
  }

  async create(schoolRequest: CreateSchoolRequest): Promise<School> {
    console.log('Creating school with request:', schoolRequest)
    try {
      const result = await this.post<School>("", schoolRequest)
      console.log('School creation successful:', result)
      return result
    } catch (error) {
      console.error('Error creating school:', error)
      // Check if the token exists in localStorage for debugging
      const token = localStorage.getItem('token')
      console.log('Auth token available:', !!token)
      if (token) {
        console.log('Token length:', token.length)
      }
      throw error
    }
  }

  async update(id: number, schoolRequest: UpdateSchoolRequest): Promise<School> {
    return this.put<School>(`/${id}`, schoolRequest)
  }

  async deleteSchool(id: number): Promise<void> {
    return this.delete<void>(`/${id}`)
  }

  async findSchoolsByAdmin(adminId: number): Promise<School[]> {
    return this.get<School[]>(`/admin/${adminId}`)
  }
}

