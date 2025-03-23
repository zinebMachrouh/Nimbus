import { StudentService } from '../StudentService';
import { Student } from '../../core/entities/student.entity';
import { BaseHttpService } from '../BaseHttpService';
import { ApiResponse } from '../../core/models/ApiResponse';

export class StudentServiceImpl extends BaseHttpService implements StudentService {
  constructor() {
    super('/v1/students');
  }

  async getAllStudents(): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>();
    return response.data;
  }

  async getStudentById(id: number): Promise<Student> {
    const response = await this.get<ApiResponse<Student>>(`/${id}`);
    return response.data;
  }

  async getStudentWithDetails(id: number): Promise<Student> {
    const response = await this.get<ApiResponse<Student>>(`/${id}/details`);
    return response.data;
  }

  async createStudent(studentData: any): Promise<Student> {
    const response = await this.post<ApiResponse<Student>>('', studentData);
    return response.data;
  }

  async updateStudent(id: number, studentData: any): Promise<Student> {
    const response = await this.put<ApiResponse<Student>>(`/${id}`, studentData);
    return response.data;
  }

  async deleteStudent(id: number): Promise<void> {
    await this.delete<ApiResponse<void>>(`/${id}`);
  }

  async findBySchoolId(schoolId: number): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>(`/school/${schoolId}`);
    return response.data;
  }

  async findByParentId(parentId: number): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>(`/parent/${parentId}`);
    return response.data;
  }

  async findByStudentId(studentId: string): Promise<Student> {
    const response = await this.get<ApiResponse<Student>>(`/student-id/${studentId}`);
    return response.data;
  }

  async findByQrCode(qrCode: string): Promise<Student> {
    const response = await this.get<ApiResponse<Student>>(`/qr-code/${qrCode}`);
    return response.data;
  }

  async searchStudents(query: string): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>(`/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  async assignToSchool(studentId: number, schoolId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${studentId}/assign-school/${schoolId}`);
  }

  async assignToParent(studentId: number, parentId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${studentId}/assign-parent/${parentId}`);
  }

  async removeFromSchool(studentId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${studentId}/remove-school`);
  }

  async removeFromParent(studentId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${studentId}/remove-parent`);
  }

  async generateQrCode(studentId: number): Promise<void> {
    await this.put<ApiResponse<void>>(`/${studentId}/generate-qr-code`);
  }

  async updateStudentDetails(studentId: number, firstName: string, lastName: string, grade: string): Promise<void> {
    await this.put<ApiResponse<void>>(
      `/${studentId}/details?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&grade=${encodeURIComponent(grade)}`
    );
  }

  async findStudentsWithAttendanceStats(schoolId: number, start: string, end: string): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>(
      `/school/${schoolId}/attendance-stats?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async countAbsences(studentId: number, start: string, end: string): Promise<number> {
    const response = await this.get<ApiResponse<number>>(
      `/${studentId}/absences/count?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async calculateAttendancePercentage(studentId: number, start: string, end: string): Promise<number> {
    const response = await this.get<ApiResponse<number>>(
      `/${studentId}/attendance/percentage?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  }

  async findStudentsByRoute(routeId: number): Promise<Student[]> {
    const response = await this.get<ApiResponse<Student[]>>(`/route/${routeId}`);
    return response.data;
  }
} 