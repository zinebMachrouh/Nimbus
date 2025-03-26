import React, { useState, useEffect } from 'react';
import { useAttendanceService } from '../../../../contexts/ServiceContext';
import { Attendance, AttendanceStatus } from '../../../../core/entities/attendance.entity';
import './AttendanceManagement.css';

const AttendanceManagement: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<number>(() => {
    const school = JSON.parse(localStorage.getItem("school") || "{}");
    return school.id || 0;
  });
  const attendanceService = useAttendanceService();

  useEffect(() => {
    const fetchAttendances = async () => {
      if (!schoolId) {
        setError('School ID not found. Please ensure you are logged in with a school account.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching all attendance records for school:', schoolId);
        const data = await attendanceService.findAllSchoolAttendance(schoolId);
        console.log('Received attendance data:', data);
        console.log('Data type:', typeof data);
        console.log('Is Array?', Array.isArray(data));
        console.log('Data length:', data?.length);
        console.log('Data structure:', JSON.stringify(data, null, 2));
        setAttendances(data || []);
      } catch (err) {
        console.error('Error fetching attendances:', err);
        setError('Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendances();
  }, [attendanceService, schoolId]);

  const handleStatusUpdate = async (attendanceId: number, newStatus: AttendanceStatus) => {
    try {
      await attendanceService.updateAttendanceStatus(attendanceId, newStatus);
      // Refresh the attendance data after update
      console.log('Refreshing attendance data after status update');
      const updatedData = await attendanceService.findAllSchoolAttendance(schoolId);
      console.log('Received updated attendance data:', updatedData);
      setAttendances(updatedData || []);
    } catch (err) {
      console.error('Error updating attendance status:', err);
      setError('Failed to update attendance status');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="attendance-management">

      <div className="attendance-stats">
        <div className="stat-card present">
          <span className="stat-label">Present</span>
          <span className="stat-value">
            {attendances.filter(a => a.status === AttendanceStatus.PRESENT).length}
          </span>
        </div>
        <div className="stat-card absent">
          <span className="stat-label">Absent</span>
          <span className="stat-value">
            {attendances.filter(a => a.status === AttendanceStatus.ABSENT).length}
          </span>
        </div>
        <div className="stat-card excused">
          <span className="stat-label">Excused</span>
          <span className="stat-value">
            {attendances.filter(a => a.status === AttendanceStatus.EXCUSED).length}
          </span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">
            {attendances.filter(a => a.status === AttendanceStatus.PENDING).length}
          </span>
        </div>
      </div>

      <div className="attendance-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" className="filter-select">
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="EXCUSED">Excused</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="date-filter">Date</label>
          <input type="date" id="date-filter" className="filter-input" />
        </div>
      </div>

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Trip</th>
              <th>Status</th>
              <th>Scan Time</th>
              <th>Parent Notified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((attendance) => (
              <tr key={attendance.id}>
                <td>
                  {attendance.student ? `${attendance.student.firstName} ${attendance.student.lastName}` : 'Unknown Student'}
                </td>
                <td>{attendance.trip.id}</td>
                <td>
                  <span className={`status-badge}`}>
                    {attendance.status}
                  </span>
                </td>
                <td>{attendance.scanTime || 'Not scanned'}</td>
                <td>
                  <span className={`notification-badge ${attendance.parentNotified ? 'notified' : 'unnotified'}`}>
                    {attendance.parentNotified ? 'Notified' : 'Not Notified'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-status" disabled={attendance.status === AttendanceStatus.PRESENT} onClick={() => handleStatusUpdate(attendance.id, AttendanceStatus.PRESENT)}>
                      Mark Present
                    </button>
                    <button className="btn-status" disabled={attendance.status === AttendanceStatus.ABSENT} onClick={() => handleStatusUpdate(attendance.id, AttendanceStatus.ABSENT)}>
                      Mark Absent
                    </button>
                    <button className="btn-status" disabled={attendance.status === AttendanceStatus.EXCUSED} onClick={() => handleStatusUpdate(attendance.id, AttendanceStatus.EXCUSED)}>
                      Mark Excused
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

export default AttendanceManagement; 