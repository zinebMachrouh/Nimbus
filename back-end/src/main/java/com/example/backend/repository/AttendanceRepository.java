package com.example.backend.repository;

import com.example.backend.entities.Attendance;
import com.example.backend.entities.Student;
import com.example.backend.entities.Trip;
import com.example.backend.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends BaseRepository<Attendance> {
    List<Attendance> findByTripIdAndActiveTrue(Long tripId);
    List<Attendance> findByStudentIdAndActiveTrue(Long studentId);
    
    @Query("""
            SELECT a FROM Attendance a 
            LEFT JOIN FETCH a.student s 
            LEFT JOIN FETCH a.trip t 
            WHERE a.id = :attendanceId AND a.active = true
            """)
    Optional<Attendance> findByIdWithDetails(Long attendanceId);
    
    @Query("""
            SELECT a FROM Attendance a 
            WHERE a.student.id = :studentId 
            AND a.scanTime BETWEEN :start AND :end 
            AND a.active = true 
            ORDER BY a.scanTime DESC
            """)
    List<Attendance> findStudentAttendanceInPeriod(Long studentId, LocalDateTime start, LocalDateTime end);
    
    @Query("""
            SELECT a FROM Attendance a 
            WHERE a.trip.id = :tripId 
            AND a.status = :status 
            AND a.active = true 
            ORDER BY a.scanTime DESC
            """)
    List<Attendance> findByTripAndStatus(Long tripId, Attendance.AttendanceStatus status);
    
    @Query("""
            SELECT a FROM Attendance a 
            WHERE a.parentNotified = false 
            AND a.active = true 
            AND a.scanTime <= :cutoffTime
            """)
    List<Attendance> findUnnotifiedAttendance(LocalDateTime cutoffTime);
    
    @Query("""
            SELECT COUNT(a) FROM Attendance a 
            WHERE a.student.school.id = :schoolId 
            AND a.status = com.example.backend.entities.Attendance$AttendanceStatus.PRESENT 
            AND CAST(a.scanTime AS date) = CURRENT_DATE
            AND a.active = true
            """)
    long countTodaysPresentAttendance(Long schoolId);
    
    @Query("""
            SELECT a FROM Attendance a 
            WHERE a.student.school.id = :schoolId 
            AND a.scanTime BETWEEN :start AND :end 
            AND a.active = true 
            ORDER BY a.scanTime DESC
            """)
    List<Attendance> findSchoolAttendanceInPeriod(Long schoolId, LocalDateTime start, LocalDateTime end);
    
    @Query("""
            SELECT a FROM Attendance a 
            WHERE a.student.parent.id = :parentId 
            AND a.active = true 
            ORDER BY a.scanTime DESC
            """)
    List<Attendance> findByParentId(Long parentId);

    long countByStudentIdAndStatusAndScanTimeBetween(Long studentId, Attendance.AttendanceStatus status, LocalDateTime start, LocalDateTime end);

    long countByStudentIdAndScanTimeBetween(Long studentId, LocalDateTime start, LocalDateTime end);

    boolean existsByStudentAndTripAndActiveTrue(Student student, Trip trip);

    @Query("""
            SELECT COUNT(a) FROM Attendance a 
            WHERE a.student.school.id = :schoolId 
            AND a.status = :attendanceStatus 
            AND a.scanTime BETWEEN :startOfDay AND :endOfDay 
            AND a.active = true
            """)
    long countBySchoolAndStatusAndDateRange(Long schoolId, Attendance.AttendanceStatus attendanceStatus, LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query("""
            SELECT DISTINCT a FROM Attendance a 
            LEFT JOIN FETCH a.student s 
            LEFT JOIN FETCH s.school 
            LEFT JOIN FETCH s.parent 
            LEFT JOIN FETCH a.trip t 
            LEFT JOIN FETCH t.route r 
            LEFT JOIN FETCH t.driver d 
            LEFT JOIN FETCH t.vehicle v 
            WHERE a.active = true 
            AND s.school.id = :schoolId 
            AND a.scanTime BETWEEN :start AND :end
            ORDER BY a.scanTime DESC
            """)
    List<Attendance> findAttendanceWithDetailsInPeriod(Long schoolId, LocalDateTime start, LocalDateTime end);

    long countByStatus(Attendance.AttendanceStatus status);

    List<Attendance> findByTripIdOrderBySeatNumberAsc(Long tripId);

    Attendance findByStudentIdAndTripId(Long studentId, Long tripId);
}