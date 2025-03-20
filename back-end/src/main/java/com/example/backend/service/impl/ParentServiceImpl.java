package com.example.backend.service.impl;

import com.example.backend.entities.Attendance;
import com.example.backend.entities.Student;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.repository.AttendanceRepository;
import com.example.backend.repository.ParentRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ParentService;
import com.example.backend.service.base.BaseServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class ParentServiceImpl extends BaseServiceImpl<Parent, ParentRepository> implements ParentService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ParentServiceImpl(ParentRepository repository,
                           StudentRepository studentRepository,
                           AttendanceRepository attendanceRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        super(repository);
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Optional<Parent> findByEmail(String email) {
        return repository.findByEmailAndActiveTrue(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public Optional<Parent> findByEmailForAuthentication(String email) {
        return repository.findByEmailForAuthentication(email);
    }

    @Override
    public long countActiveUsersByRole(User.Role role) {
        return repository.countActiveUsersByRole(role);
    }

    @Override
    public Optional<Parent> findByIdWithStudents(Long parentId) {
        log.debug("Finding parent {} with students", parentId);
        return repository.findByIdWithStudents(parentId);
    }

    @Override
    public List<Parent> findBySchoolId(Long schoolId) {
        log.debug("Finding parents for school {}", schoolId);
        validateSchoolExists(schoolId);
        return repository.findBySchoolId(schoolId);
    }

    @Override
    public long countActiveStudents(Long parentId) {
        log.debug("Counting active students for parent {}", parentId);
        validateParentExists(parentId);
        return repository.countActiveStudents(parentId);
    }

    @Override
    public List<Parent> findParentsWithUnnotifiedAttendance() {
        log.debug("Finding parents with unnotified attendance");
        return repository.findParentsWithUnnotifiedAttendance();
    }

    @Override
    public List<Parent> findActiveParentsBySchool(Long schoolId) {
        log.debug("Finding active parents for school {}", schoolId);
        validateSchoolExists(schoolId);
        return repository.findActiveParentsBySchool(schoolId);
    }

    @Override
    public Optional<Parent> findByStudentId(Long studentId) {
        log.debug("Finding parent for student {}", studentId);
        validateStudentExists(studentId);
        return repository.findByStudentId(studentId);
    }

    @Override
    @Transactional
    public void addStudent(Long parentId, Long studentId) {
        log.debug("Adding student {} to parent {}", studentId, parentId);
        
        Parent parent = findParentById(parentId);
        Student student = findStudentById(studentId);
        
        if (student.getParent() != null) {
            throw new IllegalStateException("Student is already assigned to another parent");
        }

        student.setParent(parent);
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public void removeStudent(Long parentId, Long studentId) {
        log.debug("Removing student {} from parent {}", studentId, parentId);
        
        Parent parent = findParentById(parentId);
        Student student = findStudentById(studentId);
        
        if (!student.getParent().equals(parent)) {
            throw new IllegalStateException("Student is not assigned to this parent");
        }

        student.setParent(null);
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public void notifyAboutAttendance(Long parentId, Long attendanceId) {
        log.debug("Notifying parent {} about attendance {}", parentId, attendanceId);
        
        Parent parent = findParentById(parentId);
        Attendance attendance = findAttendanceById(attendanceId);
        
        if (!attendance.getStudent().getParent().equals(parent)) {
            throw new IllegalStateException("Attendance record is not related to this parent's student");
        }

        attendance.setParentNotified(true);
        attendanceRepository.save(attendance);
    }

    @Override
    public List<Parent> findParentsWithAttendanceStats() {
        log.debug("Finding parents with attendance statistics");
        List<Parent> parents = repository.findAllByActiveTrue();
        parents.forEach(parent -> {
            long totalStudents = countActiveStudents(parent.getId());
            // Additional statistics can be added here
        });
        return parents;
    }

    @Override
    public Long getCurrentParentId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return repository.findByEmail(email)
                .map(Parent::getId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
    }

    @Override
    public void updateProfile(Long parentId, String phoneNumber, String address) {
        Parent parent = findById(parentId);
        parent.setPhoneNumber(phoneNumber);
        parent.setAddress(address);
        save(parent);
    }

    @Override
    public void changePassword(Long parentId, String currentPassword, String newPassword) {
        Parent parent = findById(parentId);
        if (!passwordEncoder.matches(currentPassword, parent.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        parent.setPassword(passwordEncoder.encode(newPassword));
        save(parent);
    }

    // Private validation methods
    private void validateSchoolExists(Long schoolId) {
        if (schoolId == null) {
            throw new IllegalArgumentException("School ID cannot be null");
        }
    }

    private void validateStudentExists(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new EntityNotFoundException("Student not found with id: " + studentId);
        }
    }

    private void validateParentExists(Long parentId) {
        if (!repository.existsById(parentId)) {
            throw new EntityNotFoundException("Parent not found with id: " + parentId);
        }
    }

    private Parent findParentById(Long parentId) {
        return repository.findById(parentId)
                .orElseThrow(() -> new EntityNotFoundException("Parent not found with id: " + parentId));
    }

    private Student findStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
    }

    private Attendance findAttendanceById(Long attendanceId) {
        return attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new EntityNotFoundException("Attendance not found with id: " + attendanceId));
    }
} 