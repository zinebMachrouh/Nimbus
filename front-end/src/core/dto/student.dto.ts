export interface StudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  schoolId: number;
  parentId: number;
} 