package com.example.backend.service;

import com.example.backend.entities.Attendance;
import com.example.backend.service.base.BaseService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceService extends BaseService<Attendance> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByTripId(Long tripId);
    Optional<Attendance> findByIdWithDetails(Long attendanceId);
    List<Attendance> findStudentAttendanceInPeriod(Long studentId, LocalDateTime start, LocalDateTime end);
    List<Attendance> findByTripAndStatus(Long tripId, String status);
    List<Attendance> findUnnotifiedAttendance(LocalDateTime cutoffTime);
    long countTodaysPresentAttendance(Long schoolId);
    List<Attendance> findSchoolAttendanceInPeriod(Long schoolId, LocalDateTime start, LocalDateTime end);
    List<Attendance> findByParentId(Long parentId);
    void recordAttendance(Long studentId, Long tripId, String status, String notes);
    void updateAttendanceStatus(Long attendanceId, String status, String notes);
    void markAsNotified(Long attendanceId);
    List<Attendance> findAttendanceWithStats(Long schoolId, LocalDateTime start, LocalDateTime end);
    /**
     * Find all attendance records for a school
     *
     * @param schoolId the ID of the school
     * @return list of attendance records
     */
    List<Attendance> findAllSchoolAttendance(Long schoolId);
} 