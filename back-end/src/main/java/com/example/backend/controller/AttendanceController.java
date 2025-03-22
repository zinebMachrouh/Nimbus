package com.example.backend.controller;

import com.example.backend.dto.attendance.AttendanceRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.Attendance;
import com.example.backend.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceController {
    private final AttendanceService attendanceService;

    @Operation(summary = "Get all attendance records")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendance() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.findAll()));
    }

    @Operation(summary = "Get attendance by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<Attendance>> getAttendanceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.findById(id)));
    }

    @Operation(summary = "Get attendance with details")
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<Attendance>> getAttendanceWithDetails(@PathVariable Long id) {
        Optional<Attendance> attendance = attendanceService.findByIdWithDetails(id);
        return attendance.map(a -> ResponseEntity.ok(ApiResponse.success(a)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Find attendance by student ID")
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.findByStudentId(studentId)));
    }

    @Operation(summary = "Find attendance by trip ID")
    @GetMapping("/trip/{tripId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findByTripId(@PathVariable Long tripId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.findByTripId(tripId)));
    }

    @Operation(summary = "Find student attendance in period")
    @GetMapping("/student/{studentId}/period")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findStudentAttendanceInPeriod(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.findStudentAttendanceInPeriod(studentId, start, end)));
    }

    @Operation(summary = "Find attendance by trip and status")
    @GetMapping("/trip/{tripId}/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findByTripAndStatus(
            @PathVariable Long tripId,
            @PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.findByTripAndStatus(tripId, status)));
    }

    @Operation(summary = "Find unnotified attendance")
    @GetMapping("/unnotified")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findUnnotifiedAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime cutoffTime) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.findUnnotifiedAttendance(cutoffTime)));
    }

    @Operation(summary = "Count today's present attendance")
    @GetMapping("/school/{schoolId}/present/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> countTodaysPresentAttendance(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.countTodaysPresentAttendance(schoolId)));
    }

    @Operation(summary = "Find school attendance in period")
    @GetMapping("/school/{schoolId}/period")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findSchoolAttendanceInPeriod(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.findSchoolAttendanceInPeriod(schoolId, start, end)));
    }

    @Operation(summary = "Find attendance by parent ID")
    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.findByParentId(parentId)));
    }

    @Operation(summary = "Record attendance")
    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> recordAttendance(@Valid @RequestBody AttendanceRequest request) {
        attendanceService.recordAttendance(
                request.getStudentId(),
                request.getTripId(),
                request.getStatus(),
                request.getNotes()
        );
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Update attendance status")
    @PutMapping("/{attendanceId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> updateAttendanceStatus(
            @PathVariable Long attendanceId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        attendanceService.updateAttendanceStatus(attendanceId, status, notes);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Mark attendance as notified")
    @PutMapping("/{attendanceId}/mark-notified")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAsNotified(@PathVariable Long attendanceId) {
        attendanceService.markAsNotified(attendanceId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find attendance with stats")
    @GetMapping("/school/{schoolId}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> findAttendanceWithStats(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.findAttendanceWithStats(schoolId, start, end)));
    }
} 