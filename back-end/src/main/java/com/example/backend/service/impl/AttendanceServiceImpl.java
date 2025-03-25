package com.example.backend.service.impl;

import com.example.backend.entities.Attendance;
import com.example.backend.entities.Student;
import com.example.backend.entities.Trip;
import com.example.backend.repository.AttendanceRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.service.AttendanceService;
import com.example.backend.service.base.BaseServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class AttendanceServiceImpl extends BaseServiceImpl<Attendance, AttendanceRepository> implements AttendanceService {

    private final StudentRepository studentRepository;
    private final TripRepository tripRepository;

    private static final long MAX_SCAN_TIME_DIFFERENCE_MINUTES = 30;
    private static final long NOTIFICATION_THRESHOLD_MINUTES = 15;
    private static final int MAX_NOTES_LENGTH = 500;

    public AttendanceServiceImpl(AttendanceRepository repository,
                               StudentRepository studentRepository,
                               TripRepository tripRepository) {
        super(repository);
        this.studentRepository = studentRepository;
        this.tripRepository = tripRepository;
    }

    @Override
    public List<Attendance> findByStudentId(Long studentId) {
        validateStudentExists(studentId);
        return repository.findByStudentIdAndActiveTrue(studentId);
    }

    @Override
    public List<Attendance> findByTripId(Long tripId) {
        validateTripExists(tripId);
        return repository.findByTripIdAndActiveTrue(tripId);
    }

    @Override
    public Optional<Attendance> findByIdWithDetails(Long attendanceId) {
        return repository.findByIdWithDetails(attendanceId);
    }

    @Override
    public List<Attendance> findStudentAttendanceInPeriod(Long studentId, LocalDateTime start, LocalDateTime end) {
        validateStudentExists(studentId);
        validateDateRange(start, end);
        return repository.findStudentAttendanceInPeriod(studentId, start, end);
    }

    @Override
    public List<Attendance> findByTripAndStatus(Long tripId, String status) {
        validateTripExists(tripId);
        validateAttendanceStatus(status);
        return repository.findByTripAndStatus(tripId, Attendance.AttendanceStatus.valueOf(status));
    }

    @Override
    public List<Attendance> findUnnotifiedAttendance(LocalDateTime cutoffTime) {
        if (cutoffTime == null) {
            cutoffTime = LocalDateTime.now().minusMinutes(NOTIFICATION_THRESHOLD_MINUTES);
        }
        return repository.findUnnotifiedAttendance(cutoffTime);
    }

    @Override
    public long countTodaysPresentAttendance(Long schoolId) {
        validateSchoolExists(schoolId);
        LocalDateTime startOfDay = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return repository.countBySchoolAndStatusAndDateRange(schoolId, Attendance.AttendanceStatus.PRESENT, startOfDay, endOfDay);
    }

    @Override
    public List<Attendance> findSchoolAttendanceInPeriod(Long schoolId, LocalDateTime start, LocalDateTime end) {
        validateSchoolExists(schoolId);
        validateDateRange(start, end);
        return repository.findSchoolAttendanceInPeriod(schoolId, start, end);
    }

    @Override
    public List<Attendance> findByParentId(Long parentId) {
        validateParentExists(parentId);
        return repository.findByParentId(parentId);
    }

    @Override
    @Transactional
    public void recordAttendance(Long studentId, Long tripId, String status, String notes) {
        log.debug("Recording attendance for student {} on trip {} with status {}", studentId, tripId, status);
        
        Student student = findStudentById(studentId);
        Trip trip = findTripById(tripId);
        
        validateAttendanceStatus(status);
        validateNotes(notes);
        validateAttendanceRecording(student, trip);

        Attendance attendance = repository.findByStudentIdAndTripId(studentId, tripId);

        attendance.setStatus(Attendance.AttendanceStatus.valueOf(status));
        attendance.setNotes(notes);
        attendance.setScanTime(LocalDateTime.now());
        attendance.setParentNotified(false);

        repository.save(attendance);
        log.info("Successfully recorded attendance for student {} on trip {}", studentId, tripId);
    }

    @Override
    @Transactional
    public void updateAttendanceStatus(Long attendanceId, String status, String notes) {
        log.debug("Updating attendance {} status to {} with notes: {}", attendanceId, status, notes);
        
        Attendance attendance = findAttendanceById(attendanceId);
        validateAttendanceStatus(status);
        validateNotes(notes);
        validateStatusUpdate(attendance);

        attendance.setStatus(Attendance.AttendanceStatus.valueOf(status));
        attendance.setNotes(notes);
        attendance.setParentNotified(false); // Reset notification flag as status has changed

        repository.save(attendance);
        log.info("Successfully updated attendance {} status to {}", attendanceId, status);
    }

    @Override
    @Transactional
    public void markAsNotified(Long attendanceId) {
        log.debug("Marking attendance {} as notified", attendanceId);
        
        Attendance attendance = findAttendanceById(attendanceId);
        validateNotificationUpdate(attendance);

        attendance.setParentNotified(true);
        repository.save(attendance);
        log.info("Successfully marked attendance {} as notified", attendanceId);
    }

    @Override
    public List<Attendance> findAttendanceWithStats(Long schoolId, LocalDateTime start, LocalDateTime end) {
        log.debug("Finding attendance with statistics for school {} between {} and {}", schoolId, start, end);
        
        validateSchoolExists(schoolId);
        validateDateRange(start, end);

        return repository.findSchoolAttendanceInPeriod(schoolId, start, end);
    }

    // Private validation methods
    private void validateStudentExists(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new EntityNotFoundException("Student not found with id: " + studentId);
        }
    }

    private void validateTripExists(Long tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new EntityNotFoundException("Trip not found with id: " + tripId);
        }
    }

    private void validateSchoolExists(Long schoolId) {
        // Assuming school validation is handled by another service
        if (schoolId == null) {
            throw new ValidationException("School ID cannot be null");
        }
    }

    private void validateParentExists(Long parentId) {
        // Assuming parent validation is handled by another service
        if (parentId == null) {
            throw new ValidationException("Parent ID cannot be null");
        }
    }

    private Student findStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
    }

    private Trip findTripById(Long tripId) {
        return tripRepository.findByIdAndActiveTrue(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with id: " + tripId));
    }

    private Attendance findAttendanceById(Long attendanceId) {
        return repository.findById(attendanceId)
                .orElseThrow(() -> new EntityNotFoundException("Attendance not found with id: " + attendanceId));
    }

    private void validateAttendanceStatus(String status) {
        try {
            Attendance.AttendanceStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid attendance status: " + status);
        }
    }

    private void validateNotes(String notes) {
        if (notes != null && notes.length() > MAX_NOTES_LENGTH) {
            throw new ValidationException("Notes cannot exceed " + MAX_NOTES_LENGTH + " characters");
        }
    }

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new ValidationException("Start and end dates cannot be null");
        }
        if (start.isAfter(end)) {
            throw new ValidationException("Start date cannot be after end date");
        }
        if (end.isAfter(LocalDateTime.now())) {
            throw new ValidationException("End date cannot be in the future");
        }
    }

    private void validateAttendanceRecording(Student student, Trip trip) {
        // Validate that student belongs to the same school as the trip's route
        if (!student.getSchool().getId().equals(trip.getRoute().getSchool().getId())) {
            throw new ValidationException("Student does not belong to the same school as the trip's route");
        }

        // Validate that student has a QR code
        if (student.getQrCode() == null) {
            throw new ValidationException("Student does not have a QR code");
        }
    }

    private void validateStatusUpdate(Attendance attendance) {
        // Validate if the attendance record is not too old to update
        if (ChronoUnit.DAYS.between(attendance.getScanTime(), LocalDateTime.now()) > 7) {
            throw new ValidationException("Cannot update attendance status after 7 days");
        }
    }

    private void validateNotificationUpdate(Attendance attendance) {
        if (attendance.getParentNotified()) {
            throw new ValidationException("Attendance is already marked as notified");
        }
    }

} 