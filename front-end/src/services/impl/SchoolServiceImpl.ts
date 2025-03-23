import { SchoolService } from '../SchoolService';
import { School } from '../../core/entities/school.entity';
import { CreateSchoolRequest, UpdateSchoolRequest } from '../../core/dto/school.dto';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class SchoolServiceImpl extends BaseHttpService implements SchoolService {
  constructor() {
    super('/v1/schools');
  }

  async findAll(): Promise<School[]> {
    const response = await this.get<ApiResponse<School[]>>();
    return response.data;
  }

  async findById(id: number): Promise<School> {
    const response = await this.get<ApiResponse<School>>(`/${id}`);
    return response.data;
  }

  async create(schoolRequest: CreateSchoolRequest): Promise<School> {
    const response = await this.post<ApiResponse<School>>('', schoolRequest);
    
    return response.data;
  }

  async update(id: number, schoolRequest: UpdateSchoolRequest): Promise<School> {
    const response = await this.put<ApiResponse<School>>(`/${id}`, schoolRequest);
    return response.data;
  }

  async deleteSchool(id: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${id}`);
  }

  async findNearbySchools(latitude: number, longitude: number, radiusInMeters: number): Promise<School[]> {
    const response = await this.get<ApiResponse<School[]>>(
      `/nearby?latitude=${latitude}&longitude=${longitude}&radiusInMeters=${radiusInMeters}`
    );
    return response.data;
  }

  async getSchoolStatistics(id: number): Promise<any> {
    const response = await this.get<ApiResponse<any>>(`/${id}/statistics`);
    return response.data;
  }

  async findSchoolsByNameContaining(name: string): Promise<School[]> {
    const response = await this.get<ApiResponse<School[]>>(`/search?name=${encodeURIComponent(name)}`);
    return response.data;
  }

  async getSchoolWithStudents(id: number): Promise<School> {
    const response = await this.get<ApiResponse<School>>(`/${id}/with-students`);
    return response.data;
  }

  async addStudent(schoolId: number, studentId: number): Promise<void> {
    await this.post<ApiResponse<void>>(`/${schoolId}/students/${studentId}`);
  }

  async removeStudent(schoolId: number, studentId: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${schoolId}/students/${studentId}`);
  }

  async addRoute(schoolId: number, routeId: number): Promise<void> {
    await this.post<ApiResponse<void>>(`/${schoolId}/routes/${routeId}`);
  }

  async removeRoute(schoolId: number, routeId: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${schoolId}/routes/${routeId}`);
  }

  async getSchoolsWithStats(): Promise<School[]> {
    const response = await this.get<ApiResponse<School[]>>('/with-stats');
    return response.data;
  }

  async countActiveSchools(): Promise<number> {
    const response = await this.get<ApiResponse<number>>('/count/active');
    return response.data;
  }

  // Alias methods for compatibility with SchoolService interface
  async createSchool(schoolData: any): Promise<School> {
    return this.create(schoolData);
  }

  async updateSchool(id: number, schoolData: any): Promise<School> {
    return this.update(id, schoolData);
  }

  async getAllSchools(): Promise<School[]> {
    return this.findAll();
  }

  async getSchoolById(id: number): Promise<School> {
    return this.findById(id);
  }
}

