package com.nimbus.controller;

import com.nimbus.dto.AttendanceDTO;
import com.nimbus.dto.request.ConfirmAttendanceRequest;
import com.nimbus.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    @GetMapping("/trip/{tripId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<List<AttendanceDTO>> getAttendancesByTripId(@PathVariable Long tripId) {
        List<AttendanceDTO> attendances = attendanceService.getAttendancesByTripId(tripId);
        return ResponseEntity.ok(attendances);
    }
    
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER') or @userSecurity.isParentOfStudent(#studentId, authentication)")
    public ResponseEntity<List<AttendanceDTO>> getAttendancesByStudentId(@PathVariable Long studentId) {
        List<AttendanceDTO> attendances = attendanceService.getAttendancesByStudentId(studentId);
        return ResponseEntity.ok(attendances);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER') or @userSecurity.canAccessAttendance(#id, authentication)")
    public ResponseEntity<AttendanceDTO> getAttendanceById(@PathVariable Long id) {
        AttendanceDTO attendance = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(attendance);
    }
    
    @PutMapping("/parent/{parentId}/confirm/{attendanceId}")
    @PreAuthorize("hasRole('PARENT') and @userSecurity.isCurrentUser(#parentId, authentication)")
    public ResponseEntity<AttendanceDTO> confirmAttendance(
            @PathVariable Long parentId,
            @PathVariable Long attendanceId,
            @Valid @RequestBody ConfirmAttendanceRequest confirmAttendanceRequest) {
        AttendanceDTO attendance = attendanceService.confirmAttendance(parentId, attendanceId, confirmAttendanceRequest);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/trip/{tripId}/absent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<List<AttendanceDTO>> getAbsentStudentsByTripId(@PathVariable Long tripId) {
        List<AttendanceDTO> absentStudents = attendanceService.getAbsentStudentsByTripId(tripId);
        return ResponseEntity.ok(absentStudents);
    }
}

