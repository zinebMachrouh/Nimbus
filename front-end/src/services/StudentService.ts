import { Student } from '../core/entities/student.entity';

export interface StudentService {
  getAllStudents(): Promise<Student[]>;
  getStudentById(id: number): Promise<Student>;
  getStudentWithDetails(id: number): Promise<Student>;
  createStudent(studentData: any): Promise<Student>;
  updateStudent(id: number, studentData: any): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  findBySchoolId(schoolId: number): Promise<Student[]>;
  findByParentId(parentId: number): Promise<Student[]>;
  findByStudentId(studentId: string): Promise<Student>;
  findByQrCode(qrCode: string): Promise<Student>;
  searchStudents(query: string): Promise<Student[]>;
  assignToSchool(studentId: number, schoolId: number): Promise<void>;
  assignToParent(studentId: number, parentId: number): Promise<void>;
  removeFromSchool(studentId: number): Promise<void>;
  removeFromParent(studentId: number): Promise<void>;
  generateQrCode(studentId: number): Promise<void>;
  updateStudentDetails(studentId: number, firstName: string, lastName: string, grade: string): Promise<void>;
  findStudentsWithAttendanceStats(schoolId: number, start: string, end: string): Promise<Student[]>;
  countAbsences(studentId: number, start: string, end: string): Promise<number>;
  calculateAttendancePercentage(studentId: number, start: string, end: string): Promise<number>;
  findStudentsByRoute(routeId: number): Promise<Student[]>;
} 