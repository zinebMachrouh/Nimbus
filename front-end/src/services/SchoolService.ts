import type { School } from "../core/entities/school.entity"
import type { CreateSchoolRequest, UpdateSchoolRequest } from "../core/dto/school.dto"

export interface SchoolService {
  findAll(): Promise<School[]>
  findById(id: number): Promise<School>
  create(schoolRequest: CreateSchoolRequest): Promise<School>
  update(id: number, schoolRequest: UpdateSchoolRequest): Promise<School>
  deleteSchool(id: number): Promise<void>
  findSchoolsByAdmin(adminId: number): Promise<School[]>
}

