export interface AttendanceRequest {
  studentId: number;
  tripId: number;
  status: string;
  notes?: string;
} 