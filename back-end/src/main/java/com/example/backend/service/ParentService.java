package com.example.backend.service;

import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.service.base.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ParentService extends BaseService<Parent> {
    Optional<Parent> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Parent> findByEmailForAuthentication(String email);
    long countActiveUsersByRole(User.Role role);
    Optional<Parent> findByIdWithStudents(Long parentId);
    List<Parent> findBySchoolId(Long schoolId);
    long countActiveStudents(Long parentId);
    List<Parent> findParentsWithUnnotifiedAttendance();
    List<Parent> findActiveParentsBySchool(Long schoolId);
    Optional<Parent> findByStudentId(Long studentId);
    void addStudent(Long parentId, Long studentId);
    void removeStudent(Long parentId, Long studentId);
    void notifyAboutAttendance(Long parentId, Long attendanceId);
    List<Parent> findParentsWithAttendanceStats();
    Long getCurrentParentId();
    void updateProfile(Long parentId, String phoneNumber, String address);
    void changePassword(Long parentId, String currentPassword, String newPassword);
} 