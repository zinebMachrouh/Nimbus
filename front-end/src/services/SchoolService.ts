import type { School } from "../core/entities/school.entity"
import type { CreateSchoolRequest, UpdateSchoolRequest } from "../core/dto/school.dto"

export interface SchoolService {
  findAll(): Promise<School[]>
  findById(id: number): Promise<School>
  create(schoolRequest: CreateSchoolRequest): Promise<School>
  update(id: number, schoolRequest: UpdateSchoolRequest): Promise<School>
  deleteSchool(id: number): Promise<void>
  findNearbySchools(latitude: number, longitude: number, radiusInMeters: number): Promise<School[]>
  getSchoolStatistics(id: number): Promise<any>
  findSchoolsByNameContaining(name: string): Promise<School[]>
  getSchoolWithStudents(id: number): Promise<School>
  addStudent(schoolId: number, studentId: number): Promise<void>
  removeStudent(schoolId: number, studentId: number): Promise<void>
  addRoute(schoolId: number, routeId: number): Promise<void>
  removeRoute(schoolId: number, routeId: number): Promise<void>
  getSchoolsWithStats(): Promise<School[]>
  countActiveSchools(): Promise<number>
  
  // These aliases are used in the UI components
  getAllSchools(): Promise<School[]>
  getSchoolById(id: number): Promise<School>
  createSchool(schoolData: any): Promise<School>
  updateSchool(id: number, schoolData: any): Promise<School>
}

