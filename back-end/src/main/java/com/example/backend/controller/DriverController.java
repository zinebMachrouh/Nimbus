package com.example.backend.controller;

import com.example.backend.dto.request.ReportIssueRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.DriverResponseDTO;
import com.example.backend.entities.Trip;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Driver;
import com.example.backend.service.AttendanceService;
import com.example.backend.service.DriverService;
import com.example.backend.service.TripService;
import com.example.backend.service.VehicleService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Driver Management", description = "APIs for managing drivers")
@SecurityRequirement(name = "bearerAuth")
public class DriverController {
    private final TripService tripService;
    private final DriverService driverService;
    private final VehicleService vehicleService;
    private final AttendanceService attendanceService;

    @Operation(summary = "Get All Drivers By School")
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Driver>> getAllDriversBySchoolId(@PathVariable Long schoolId) {
        return ResponseEntity.ok(driverService.findBySchoolId(schoolId));
    }

    @PostMapping("/trips/{tripId}/start")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Start a trip")
    public ResponseEntity<ApiResponse<Trip>> startTrip(@PathVariable Long tripId) {
        tripService.startTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success("Trip started successfully", tripService.findById(tripId)));
    }

    @PostMapping("/trips/{tripId}/end")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "End a trip")
    public ResponseEntity<ApiResponse<Trip>> endTrip(@PathVariable Long tripId) {
        tripService.completeTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success("Trip ended successfully", tripService.findById(tripId)));
    }

    @PostMapping("/trips/{tripId}/attendance/{studentId}")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Record student attendance")
    public ResponseEntity<ApiResponse<Void>> recordAttendance(
            @PathVariable Long tripId,
            @PathVariable Long studentId,
            @RequestParam String status) {
        attendanceService.recordAttendance(tripId, studentId, status, "Driver recorded");
        return ResponseEntity.ok(ApiResponse.success("Attendance recorded successfully"));
    }

    @PostMapping("/trips/{tripId}/attendance/{studentId}/absent")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Mark student as absent")
    public ResponseEntity<ApiResponse<Void>> markAbsent(
            @PathVariable Long tripId,
            @PathVariable Long studentId) {
        attendanceService.recordAttendance(tripId, studentId, "ABSENT", "Student marked as absent");
        return ResponseEntity.ok(ApiResponse.success("Student marked as absent"));
    }

    @GetMapping("/vehicles/current")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Get current vehicle")
    public ResponseEntity<ApiResponse<Vehicle>> getCurrentVehicle() {
        return ResponseEntity.ok(ApiResponse.success(driverService.getCurrentVehicle()));
    }

    @PostMapping("/location")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Update driver location")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        Long driverId = driverService.getCurrentDriverId();
        driverService.updateLocation(driverId, latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully"));
    }

    @PostMapping("/status/available")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Mark driver as available")
    public ResponseEntity<ApiResponse<Void>> markAsAvailable() {
        Long driverId = driverService.getCurrentDriverId();
        driverService.markAsAvailable(driverId);
        return ResponseEntity.ok(ApiResponse.success("Driver marked as available"));
    }

    @PostMapping("/status/unavailable")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Mark driver as unavailable")
    public ResponseEntity<ApiResponse<Void>> markAsUnavailable() {
        Long driverId = driverService.getCurrentDriverId();
        driverService.markAsUnavailable(driverId);
        return ResponseEntity.ok(ApiResponse.success("Driver marked as unavailable"));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Update driver profile")
    public ResponseEntity<ApiResponse<Driver>> updateProfile(
            @RequestParam String phoneNumber,
            @RequestParam String licenseNumber,
            @RequestParam LocalDateTime licenseExpiryDate) {
        Long driverId = driverService.getCurrentDriverId();
        driverService.updateProfile(driverId, phoneNumber, licenseNumber, licenseExpiryDate);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", driverService.findById(driverId)));
    }

    @GetMapping("/trips/completed")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Get completed trips count")
    public ResponseEntity<ApiResponse<Long>> getCompletedTripsCount(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        Long driverId = driverService.getCurrentDriverId();
        return ResponseEntity.ok(ApiResponse.success(driverService.countCompletedTripsInPeriod(driverId, start, end)));
    }

    // Statistics
    @Operation(summary = "Get driver statistics")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Long driverId = driverService.getCurrentDriverId();
        long completedTrips = driverService.countCompletedTripsInPeriod(driverId, start, end);
        return ResponseEntity.ok(ApiResponse.success("Driver statistics retrieved successfully", 
            Map.of("completedTrips", completedTrips)));
    }

    @Operation(summary = "Get driver by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<DriverResponseDTO>> getDriverById(@PathVariable Long id) {
        Driver driver = driverService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(DriverResponseDTO.fromDriver(driver)));
    }

    @Operation(summary = "Report an issue")
    @PostMapping("/issues")
    public ResponseEntity<ApiResponse<?>> reportIssue(@Valid @RequestBody ReportIssueRequest request) {
        // TODO: Implement issue reporting
        return ResponseEntity.ok(ApiResponse.success("Issue reported successfully"));
    }
} 