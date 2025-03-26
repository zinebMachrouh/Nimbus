package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.trip.TripRequest;
import com.example.backend.entities.Trip;
import com.example.backend.entities.Student;
import com.example.backend.service.TripService;
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

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "Trip management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TripController {
    private final TripService tripService;

    @Operation(summary = "Get all trips")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> getAllTrips() {
        return ResponseEntity.ok(ApiResponse.success(tripService.findAll()));
    }

    @Operation(summary = "Get trip by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<Trip>> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findById(id)));
    }

    @Operation(summary = "Get trip with details")
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<Trip>> getTripWithDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByIdWithDetails(id)));
    }

    @Operation(summary = "Create a new trip")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Trip>> createTrip(@Valid @RequestBody TripRequest tripRequest) {
        
        return ResponseEntity.ok(ApiResponse.success(tripService.create(tripRequest)));
    }

    @Operation(summary = "Delete a trip")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(@PathVariable Long id) {
        tripService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find trips by driver ID")
    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findByDriverId(@PathVariable Long driverId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByDriverId(driverId)));
    }

    @Operation(summary = "Find trips by vehicle ID")
    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByVehicleId(vehicleId)));
    }

    @Operation(summary = "Find trips by route ID")
    @GetMapping("/route/{routeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findByRouteId(@PathVariable Long routeId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByRouteId(routeId)));
    }

    @Operation(summary = "Find upcoming trips")
    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Trip>>> findUpcomingTrips(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findUpcomingTrips(start, end)));
    }

    @Operation(summary = "Find active trips")
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findActiveTrips() {
        return ResponseEntity.ok(ApiResponse.success(tripService.findActiveTrips()));
    }

    @Operation(summary = "Find upcoming trips by driver")
    @GetMapping("/driver/{driverId}/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findUpcomingTripsByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findUpcomingTripsByDriver(driverId)));
    }

    @Operation(summary = "Count active trips for school")
    @GetMapping("/school/{schoolId}/count")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> countActiveTripsForSchool(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.countActiveTripsForSchool(schoolId)));
    }

    @Operation(summary = "Assign driver to trip")
    @PutMapping("/{tripId}/driver/{driverId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignDriver(
            @PathVariable Long tripId,
            @PathVariable Long driverId) {
        tripService.assignDriver(tripId, driverId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Assign vehicle to trip")
    @PutMapping("/{tripId}/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignVehicle(
            @PathVariable Long tripId,
            @PathVariable Long vehicleId) {
        tripService.assignVehicle(tripId, vehicleId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Update trip status")
    @PutMapping("/{tripId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> updateTripStatus(
            @PathVariable Long tripId,
            @RequestParam String status) {
        tripService.updateTripStatus(tripId, status);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Update trip schedule")
    @PutMapping("/{tripId}/schedule")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateTripSchedule(
            @PathVariable Long tripId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime estimatedArrivalTime) {
        tripService.updateTripSchedule(tripId, departureTime, estimatedArrivalTime);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find trips with statistics")
    @GetMapping("/school/{schoolId}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Trip>>> findTripsWithStats(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findTripsWithStats(schoolId, start, end)));
    }

    @Operation(summary = "Start trip")
    @PostMapping("/{tripId}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> startTrip(@PathVariable Long tripId) {
        tripService.startTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Complete trip")
    @PostMapping("/{tripId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> completeTrip(@PathVariable Long tripId) {
        tripService.completeTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Cancel trip")
    @PostMapping("/{tripId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelTrip(
            @PathVariable Long tripId,
            @RequestParam String reason) {
        tripService.cancelTrip(tripId, reason);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find trips by student ID")
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Trip>>> findByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByStudentId(studentId)));
    }

    @Operation(summary = "Find trips by school ID")
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findBySchoolId(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findBySchoolId(schoolId)));
    }

    @Operation(summary = "Find trips by date range")
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByDateRange(start, end)));
    }

    @Operation(summary = "Find trips by status")
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> findByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByStatus(status)));
    }

    @Operation(summary = "Create and start trip")
    @PostMapping("/create-and-start/{routeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Trip>> createAndStartTrip(@PathVariable Long routeId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.createAndStartTrip(routeId)));
    }

    @Operation(summary = "End current trip")
    @PostMapping("/end-current")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Trip>> endCurrentTrip() {
        return ResponseEntity.ok(ApiResponse.success(tripService.endCurrentTrip()));
    }

    @Operation(summary = "Get current trip")
    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<Trip>> getCurrentTrip() {
        return ResponseEntity.ok(ApiResponse.success(tripService.getCurrentTrip()));
    }

    @Operation(summary = "Get trip history")
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Trip>>> getTripHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getTripHistory(page, size)));
    }

    @Operation(summary = "Find current trip by student ID")
    @GetMapping("/student/{studentId}/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<Trip>> findCurrentTripByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findCurrentTripByStudentId(studentId)));
    }

    @Operation(summary = "Find trips by student ID (paginated)")
    @GetMapping("/student/{studentId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Trip>>> findTripsByStudentId(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findTripsByStudentId(studentId, page, size)));
    }

    @Operation(summary = "Assign students to trip")
    @PutMapping("/{tripId}/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Trip>> assignStudents(
            @PathVariable Long tripId,
            @RequestBody List<Long> studentIds) {
        return ResponseEntity.ok(ApiResponse.success(tripService.assignStudents(tripId, studentIds)));
    }

    @Operation(summary = "Get assigned students for a trip")
    @GetMapping("/{tripId}/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> getAssignedStudents(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getAssignedStudents(tripId)));
    }

    @Operation(summary = "Get unassigned students for a trip")
    @GetMapping("/{tripId}/unassigned-students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<Student>> getUnassignedStudents(
            @PathVariable Long tripId,
            @RequestParam Long schoolId) {
        List<Student> unassignedStudents = tripService.findUnassignedStudents(tripId, schoolId);
        return ResponseEntity.ok(unassignedStudents);
    }
} 