package com.example.backend.service.impl;

import com.example.backend.entities.Attendance;
import com.example.backend.entities.School;
import com.example.backend.entities.Student;
import com.example.backend.entities.user.Parent;
import com.example.backend.repository.AttendanceRepository;
import com.example.backend.repository.ParentRepository;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.service.StudentService;
import com.example.backend.service.base.BaseServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@Transactional(readOnly = true)
public class StudentServiceImpl extends BaseServiceImpl<Student, StudentRepository> implements StudentService {

    private final SchoolRepository schoolRepository;
    private final ParentRepository parentRepository;
    private final AttendanceRepository attendanceRepository;
    
    private static final int MINIMUM_STUDENT_AGE = 4;
    private static final int MAXIMUM_STUDENT_AGE = 20;
    private static final int MAXIMUM_STUDENTS_PER_PARENT = 5;
    private static final int MAXIMUM_STUDENTS_PER_SCHOOL = 2000;

    public StudentServiceImpl(StudentRepository repository,
                            SchoolRepository schoolRepository,
                            ParentRepository parentRepository,
                            AttendanceRepository attendanceRepository) {
        super(repository);
        this.schoolRepository = schoolRepository;
        this.parentRepository = parentRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public List<Student> findBySchoolId(Long schoolId) {
        validateSchoolExists(schoolId);
        return repository.findBySchoolIdAndActiveTrue(schoolId);
    }

    @Override
    public List<Student> findByParentId(Long parentId) {
        validateParentExists(parentId);
        return repository.findByParentIdAndActiveTrue(parentId);
    }

    @Override
    public Optional<Student> findByStudentId(String studentId) {
        if (!StringUtils.hasText(studentId)) {
            throw new ValidationException("Student ID cannot be empty");
        }
        return repository.findByStudentIdAndActiveTrue(studentId);
    }

    @Override
    public Optional<Student> findByQrCode(String qrCode) {
        if (!StringUtils.hasText(qrCode)) {
            throw new ValidationException("QR code cannot be empty");
        }
        return repository.findByQrCode(qrCode);
    }

    @Override
    public Optional<Student> findByIdWithDetails(Long id) {
        return repository.findByIdWithDetails(id);
    }

    @Override
    public List<Student> searchStudents(String query) {
        if (!StringUtils.hasText(query)) {
            throw new ValidationException("Search query cannot be empty");
        }
        return repository.searchStudents(query);
    }

    @Override
    @Transactional
    public void assignToSchool(Long studentId, Long schoolId) {
        log.debug("Assigning student {} to school {}", studentId, schoolId);
        
        Student student = findStudentById(studentId);
        School school = findSchoolById(schoolId);
        
        // Validate school capacity
        long currentStudentCount = repository.countBySchoolIdAndActiveTrue(schoolId);
        if (currentStudentCount >= MAXIMUM_STUDENTS_PER_SCHOOL) {
            throw new ValidationException("School has reached maximum student capacity");
        }

        if (student.getSchool() != null) {
            if (student.getSchool().getId().equals(schoolId)) {
                throw new ValidationException("Student is already assigned to this school");
            }
            throw new ValidationException("Student is already assigned to another school");
        }

        student.setSchool(school);
        repository.save(student);
        log.info("Successfully assigned student {} to school {}", studentId, schoolId);
    }

    @Override
    @Transactional
    public void assignToParent(Long studentId, Long parentId) {
        log.debug("Assigning student {} to parent {}", studentId, parentId);
        
        Student student = findStudentById(studentId);
        Parent parent = findParentById(parentId);
        
        // Validate parent's student capacity
        long currentStudentCount = repository.countByParentIdAndActiveTrue(parentId);
        if (currentStudentCount >= MAXIMUM_STUDENTS_PER_PARENT) {
            throw new ValidationException("Parent has reached maximum student capacity");
        }

        if (student.getParent() != null) {
            if (student.getParent().getId().equals(parentId)) {
                throw new ValidationException("Student is already assigned to this parent");
            }
            throw new ValidationException("Student is already assigned to another parent");
        }

        student.setParent(parent);
        repository.save(student);
        log.info("Successfully assigned student {} to parent {}", studentId, parentId);
    }

    @Override
    @Transactional
    public void removeFromSchool(Long studentId) {
        log.debug("Removing student {} from school", studentId);
        
        Student student = findStudentById(studentId);
        
        if (student.getSchool() == null) {
            throw new ValidationException("Student is not assigned to any school");
        }

        student.setSchool(null);
        repository.save(student);
        log.info("Successfully removed student {} from school", studentId);
    }

    @Override
    @Transactional
    public void removeFromParent(Long studentId) {
        log.debug("Removing student {} from parent", studentId);
        
        Student student = findStudentById(studentId);
        
        if (student.getParent() == null) {
            throw new ValidationException("Student is not assigned to any parent");
        }

        student.setParent(null);
        repository.save(student);
        log.info("Successfully removed student {} from parent", studentId);
    }

    @Override
    @Transactional
    public void generateQrCode(Long studentId) {
        log.debug("Generating QR code for student {}", studentId);
        
        Student student = findStudentById(studentId);
        
        // Generate a unique QR code using UUID and student information
        String qrCode = String.format("NIMBUS-%s-%s-%s",
            student.getStudentId(),
            UUID.randomUUID().toString().substring(0, 8),
            student.getSeatNumber());
        
        student.setQrCode(qrCode);
        repository.save(student);
        log.info("Successfully generated QR code for student {}", studentId);
    }

    @Override
    @Transactional
    public void updateStudentDetails(Long studentId, String firstName, String lastName, String grade) {
        log.debug("Updating details for student {}", studentId);
        
        Student student = findStudentById(studentId);
        validateStudentDetails(firstName, lastName);

        if (StringUtils.hasText(firstName)) {
            student.setFirstName(firstName);
        }
        if (StringUtils.hasText(lastName)) {
            student.setLastName(lastName);
        }

        repository.save(student);
        log.info("Successfully updated details for student {}", studentId);
    }

    @Override
    public List<Student> findStudentsWithAttendanceStats(Long schoolId, LocalDateTime start, LocalDateTime end) {
        log.debug("Finding students with attendance stats for school {} between {} and {}", schoolId, start, end);
        
        validateSchoolExists(schoolId);
        validateDateRange(start, end);
        
        List<Student> students = repository.findBySchoolIdAndActiveTrue(schoolId);
        students.forEach(student -> {
            double attendancePercentage = calculateAttendancePercentage(student.getId(), start, end);
            student.setAttendancePercentage(attendancePercentage);
        });
        
        return students;
    }

    @Override
    public long countAbsences(Long studentId, LocalDateTime start, LocalDateTime end) {
        log.debug("Counting absences for student {} between {} and {}", studentId, start, end);
        
        validateDateRange(start, end);
        findStudentById(studentId);
        
        return attendanceRepository.countByStudentIdAndStatusAndScanTimeBetween(
            studentId, Attendance.AttendanceStatus.ABSENT, start, end);
    }

    @Override
    public double calculateAttendancePercentage(Long studentId, LocalDateTime start, LocalDateTime end) {
        log.debug("Calculating attendance percentage for student {} between {} and {}", studentId, start, end);
        
        validateDateRange(start, end);
        findStudentById(studentId);
        
        long totalDays = attendanceRepository.countByStudentIdAndScanTimeBetween(studentId, start, end);
        if (totalDays == 0) {
            return 100.0;
        }
        
        long absences = countAbsences(studentId, start, end);
        return ((double) (totalDays - absences) / totalDays) * 100;
    }

    @Override
    public List<Student> findStudentsByRoute(Long routeId) {
        log.debug("Finding students for route {}", routeId);
        validateRouteExists(routeId);
        
        return repository.findByRouteId(routeId);
    }

    // Private validation methods
    private void validateSchoolExists(Long schoolId) {
        if (!schoolRepository.existsById(schoolId)) {
            throw new EntityNotFoundException("School not found with id: " + schoolId);
        }
    }

    private void validateParentExists(Long parentId) {
        if (!parentRepository.existsById(parentId)) {
            throw new EntityNotFoundException("Parent not found with id: " + parentId);
        }
    }

    private void validateRouteExists(Long routeId) {
        if (routeId == null) {
            throw new ValidationException("Route ID cannot be null");
        }
    }

    private Student findStudentById(Long studentId) {
        return repository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
    }

    private School findSchoolById(Long schoolId) {
        return schoolRepository.findById(schoolId)
                .orElseThrow(() -> new EntityNotFoundException("School not found with id: " + schoolId));
    }

    private Parent findParentById(Long parentId) {
        return parentRepository.findById(parentId)
                .orElseThrow(() -> new EntityNotFoundException("Parent not found with id: " + parentId));
    }

    private void validateStudentDetails(String firstName, String lastName) {
        if (!StringUtils.hasText(firstName)) {
            throw new ValidationException("First name cannot be empty");
        }
        if (!StringUtils.hasText(lastName)) {
            throw new ValidationException("Last name cannot be empty");
        }
        if (firstName.length() > 50) {
            throw new ValidationException("First name cannot exceed 50 characters");
        }
        if (lastName.length() > 50) {
            throw new ValidationException("Last name cannot exceed 50 characters");
        }
    }

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new ValidationException("Start and end dates cannot be null");
        }
        if (start.isAfter(end)) {
            throw new ValidationException("Start date cannot be after end date");
        }
    }
} 