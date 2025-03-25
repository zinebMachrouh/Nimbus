import React, { useEffect, useState } from 'react';
import { useAttendanceService } from '../../contexts/AttendanceContext';
import { Attendance, AttendanceStatus } from '../../core/entities/attendance.entity';
import { Student } from '../../core/entities/student.entity';
import { Trip } from '../../core/entities/trip.entity';
import './AttendanceManagement.css';

interface AttendanceManagementProps {
  tripId: number;
  students: Student[];
  onAttendanceUpdate?: () => void;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  tripId,
  students,
  onAttendanceUpdate,
}) => {
  const attendanceService = useAttendanceService();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    fetchAttendances();
  }, [tripId, selectedDate]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.findByTripId(tripId);
      setAttendances(data);
      
      // Fetch attendance stats
      const statsData = await attendanceService.getStudentAttendanceStats(
        students[0]?.id || 0,
        selectedDate,
        selectedDate
      );
      setStats(statsData);
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (attendanceId: number, status: AttendanceStatus, notes?: string) => {
    try {
      await attendanceService.updateAttendanceStatus(attendanceId, status, notes);
      await fetchAttendances();
      onAttendanceUpdate?.();
    } catch (err) {
      console.error('Error updating attendance status:', err);
      setError('Failed to update attendance status');
    }
  };

  const handleBulkUpdate = async (status: AttendanceStatus) => {
    try {
      const updates = attendances.map(attendance => ({
        id: attendance.id,
        status,
        notes: `Bulk update to ${status}`
      }));
      await attendanceService.bulkUpdateAttendance(updates);
      await fetchAttendances();
      onAttendanceUpdate?.();
    } catch (err) {
      console.error('Error performing bulk update:', err);
      setError('Failed to perform bulk update');
    }
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return '#4CAF50';
      case AttendanceStatus.ABSENT:
        return '#F44336';
      case AttendanceStatus.LATE:
        return '#FF9800';
      case AttendanceStatus.EXCUSED:
        return '#9C27B0';
      case AttendanceStatus.PENDING:
        return '#607D8B';
      case AttendanceStatus.ABSENT_NOTIFIED:
        return '#795548';
      default:
        return '#000000';
    }
  };

  if (loading) {
    return <div className="attendance-loading">Loading attendance data...</div>;
  }

  if (error) {
    return (
      <div className="attendance-error">
        <p>{error}</p>
        <button onClick={fetchAttendances} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="attendance-management">
      <div className="attendance-header">
        <h2>Attendance Management</h2>
        <div className="attendance-controls">
          <div className="date-picker-container">
            <label htmlFor="attendance-date">Select Date:</label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>
          <div className="bulk-actions">
            <button
              onClick={() => handleBulkUpdate(AttendanceStatus.PRESENT)}
              className="bulk-button present"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleBulkUpdate(AttendanceStatus.ABSENT)}
              className="bulk-button absent"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="attendance-stats">
          <div className="stat-item">
            <span className="stat-label">Total Students:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Present:</span>
            <span className="stat-value present">{stats.present}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Absent:</span>
            <span className="stat-value absent">{stats.absent}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Late:</span>
            <span className="stat-value late">{stats.late}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Excused:</span>
            <span className="stat-value excused">{stats.excused}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Attendance Rate:</span>
            <span className="stat-value">{stats.percentage}%</span>
          </div>
        </div>
      )}

      <div className="attendance-table">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Scan Time</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((attendance) => (
              <tr key={attendance.id}>
                <td>{attendance.student.name}</td>
                <td>{attendance.student.grade}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(attendance.status) }}
                  >
                    {attendance.status}
                  </span>
                </td>
                <td>{attendance.scanTime || 'Not scanned'}</td>
                <td>{attendance.notes || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleStatusUpdate(attendance.id, AttendanceStatus.PRESENT)}
                      className="action-button present"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(attendance.id, AttendanceStatus.ABSENT)}
                      className="action-button absent"
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(attendance.id, AttendanceStatus.LATE)}
                      className="action-button late"
                    >
                      Late
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(attendance.id, AttendanceStatus.EXCUSED)}
                      className="action-button excused"
                    >
                      Excused
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 