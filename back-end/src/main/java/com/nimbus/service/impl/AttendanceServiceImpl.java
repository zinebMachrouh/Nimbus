package com.nimbus.service.impl;

import com.nimbus.dto.AttendanceDTO;
import com.nimbus.dto.request.ConfirmAttendanceRequest;
import com.nimbus.exception.ResourceNotFoundException;
import com.nimbus.exception.UnauthorizedException;
import com.nimbus.mapper.AttendanceMapper;
import com.nimbus.model.Attendance;
import com.nimbus.model.Parent;
import com.nimbus.model.Student;
import com.nimbus.model.Trip;
import com.nimbus.repository.AttendanceRepository;
import com.nimbus.repository.ParentRepository;
import com.nimbus.repository.StudentRepository;
import com.nimbus.repository.TripRepository;
import com.nimbus.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final TripRepository tripRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final AttendanceMapper attendanceMapper;
    
    @Override
    public List<AttendanceDTO> getAttendancesByTripId(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        return attendanceRepository.findByTrip(trip).stream()
                .map(attendanceMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AttendanceDTO> getAttendancesByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        
        return attendanceRepository.findByStudent(student).stream()
                .map(attendanceMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public AttendanceDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        
        return attendanceMapper.toDTO(attendance);
    }
    
    @Override
    @Transactional
    public AttendanceDTO confirmAttendance(Long parentId, Long attendanceId, ConfirmAttendanceRequest confirmAttendanceRequest) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + parentId));
        
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + attendanceId));
        
        // Verify that the attendance record belongs to a student of the parent
        if (!attendance.getStudent().getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedException("You are not authorized to confirm this attendance");
        }
        
        attendance.setParentConfirmed(true);
        attendance.setParentNote(confirmAttendanceRequest.getNote());
        attendanceRepository.save(attendance);
        
        return attendanceMapper.toDTO(attendance);
    }
    
    @Override
    public List<AttendanceDTO> getAbsentStudentsByTripId(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        return attendanceRepository.findByTripAndPresent(trip, false).stream()
                .map(attendanceMapper::toDTO)
                .collect(Collectors.toList());
    }
}

