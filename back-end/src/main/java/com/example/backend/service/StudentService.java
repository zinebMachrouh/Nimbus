package com.example.backend.service;

import com.example.backend.entities.Student;
import com.example.backend.service.base.BaseService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudentService extends BaseService<Student> {
    List<Student> findBySchoolId(Long schoolId);
    List<Student> findByParentId(Long parentId);
    Optional<Student> findByQrCode(String qrCode);
    Optional<Student> findByIdWithDetails(Long id);
    List<Student> searchStudents(String query);
    void assignToSchool(Long studentId, Long schoolId);
    void assignToParent(Long studentId, Long parentId);
    void removeFromSchool(Long studentId);
    void removeFromParent(Long studentId);
    void generateQrCode(Long studentId);
    void updateStudentDetails(Long studentId, String firstName, String lastName, String grade);
    List<Student> findStudentsWithAttendanceStats(Long schoolId, LocalDateTime start, LocalDateTime end);
    long countAbsences(Long studentId, LocalDateTime start, LocalDateTime end);
    double calculateAttendancePercentage(Long studentId, LocalDateTime start, LocalDateTime end);
    List<Student> findStudentsByRoute(Long routeId);
} 