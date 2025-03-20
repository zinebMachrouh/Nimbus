package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.Attendance;
import com.example.backend.entities.Student;
import com.example.backend.entities.Trip;
import com.example.backend.service.AttendanceService;
import com.example.backend.service.ParentService;
import com.example.backend.service.StudentService;
import com.example.backend.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARENT')")
@Tag(name = "Parent", description = "Parent operations endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ParentController {
    private final ParentService parentService;
    private final StudentService studentService;
    private final TripService tripService;
    private final AttendanceService attendanceService;

    // Children Management
    @Operation(summary = "Get all children")
    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<Student>>> getChildren() {
        List<Student> children = studentService.findByParentId(getCurrentParentId());
        return ResponseEntity.ok(ApiResponse.success("Children retrieved successfully", children));
    }

    @Operation(summary = "Get child details")
    @GetMapping("/children/{childId}")
    public ResponseEntity<ApiResponse<Student>> getChildDetails(@PathVariable Long childId) {
        Student student = studentService.findByIdWithDetails(childId)
            .orElseThrow(() -> new IllegalArgumentException("Child not found"));
        return ResponseEntity.ok(ApiResponse.success("Child details retrieved successfully", student));
    }

    // Trip Tracking
    @Operation(summary = "Get child's current trip")
    @GetMapping("/children/{childId}/current-trip")
    public ResponseEntity<ApiResponse<Trip>> getChildCurrentTrip(@PathVariable Long childId) {
        Trip trip = tripService.findCurrentTripByStudentId(childId);
        return ResponseEntity.ok(ApiResponse.success("Current trip retrieved successfully", trip));
    }

    @Operation(summary = "Get child's trip history")
    @GetMapping("/children/{childId}/trips")
    public ResponseEntity<ApiResponse<List<Trip>>> getChildTripHistory(
            @PathVariable Long childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<Trip> trips = tripService.findTripsByStudentId(childId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Trip history retrieved successfully", trips));
    }

    // Attendance Management
    @Operation(summary = "Get child's attendance history")
    @GetMapping("/children/{childId}/attendance")
    public ResponseEntity<ApiResponse<List<Attendance>>> getChildAttendance(
            @PathVariable Long childId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<Attendance> attendance = attendanceService.findStudentAttendanceInPeriod(childId, start, end);
        return ResponseEntity.ok(ApiResponse.success("Attendance history retrieved successfully", attendance));
    }

    @Operation(summary = "Get child's attendance statistics")
    @GetMapping("/children/{childId}/attendance/stats")
    public ResponseEntity<ApiResponse<Object>> getChildAttendanceStats(
            @PathVariable Long childId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        double percentage = studentService.calculateAttendancePercentage(childId, start, end);
        long absences = studentService.countAbsences(childId, start, end);
        
        Map<String, Object> stats = Map.of(
            "attendancePercentage", percentage,
            "absences", absences
        );
        
        return ResponseEntity.ok(ApiResponse.success("Attendance statistics retrieved successfully", stats));
    }

    // Profile Management
    @Operation(summary = "Update parent profile")
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String address) {
        parentService.updateProfile(getCurrentParentId(), phoneNumber, address);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully"));
    }

    @Operation(summary = "Change password")
    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        parentService.changePassword(getCurrentParentId(), currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    // Helper method to get current parent ID
    private Long getCurrentParentId() {
        return parentService.getCurrentParentId();
    }
} 