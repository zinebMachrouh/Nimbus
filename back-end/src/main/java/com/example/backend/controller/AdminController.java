package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.request.CreateDriverRequest;
import com.example.backend.dto.request.CreateParentRequest;
import com.example.backend.dto.request.CreateStudentRequest;
import com.example.backend.dto.request.UpdateParentRequest;
import com.example.backend.dto.school.SchoolRequest;
import com.example.backend.dto.vehicle.VehicleRequest;
import com.example.backend.entities.*;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.service.*;
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
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    private final UserService userService;
    private final SchoolService schoolService;
    private final RouteService routeService;
    private final TripService tripService;
    private final VehicleService vehicleService;
    private final AttendanceService attendanceService;
    private final StudentService studentService;
    private final DriverService driverService;
    private final AdminService adminService;

    @Operation(summary = "Get all users")
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.findAll()));
    }

    @Operation(summary = "Get users by role")
    @GetMapping("/users/role/{role}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(@PathVariable String role) {
        User.Role userRole;
        try {
            userRole = User.Role.valueOf(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + role, "INVALID_ROLE"));
        }
        
        List<User> users = userService.findByRole(userRole);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @Operation(summary = "Get all drivers")
    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<Driver>>> getAllDrivers() {
        List<Driver> drivers = driverService.findAll();
        return ResponseEntity.ok(ApiResponse.success(drivers));
    }
    
    @Operation(summary = "Get all parents (both active and inactive)")
    @GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<Parent>>> getAllParents() {
        List<Parent> parents = userService.findAllParentsIncludingInactive();
        return ResponseEntity.ok(ApiResponse.success(parents));
    }

    @Operation(summary = "Create a new parent account")
    @PostMapping("/parents")
    public ResponseEntity<ApiResponse<Parent>> createParent(@Valid @RequestBody CreateParentRequest request) {
        // Create parent directly, not casting from User
        Parent parent = userService.createParent(
            request.getFirstName(), request.getLastName(), request.getEmail(),
            request.getPassword(), request.getPhoneNumber(), request.getAddress()
        );
        // Ensure parent is active
        if (request.getIsActive() != null) {
            parent.setActive(request.getIsActive());
            parent = userService.save(parent);
        }
        // Ensure active status is not null
        parent = userService.ensureActiveStatus(parent);
        return ResponseEntity.ok(ApiResponse.success("Parent account created successfully", parent));
    }

    @Operation(summary = "Update parent account")
    @PatchMapping("/parents/{parentId}")
    public ResponseEntity<ApiResponse<Parent>> updateParent(
            @PathVariable Long parentId, 
            @RequestBody CreateParentRequest request) {
        // Call without casting
        Parent parent = userService.updateParent(
            parentId,
            request.getFirstName(), 
            request.getLastName(), 
            request.getEmail(),
            request.getPhoneNumber(), 
            request.getAddress(),
            null, // emergencyContact
            null  // emergencyPhone
        );
        // Ensure parent is active if explicitly provided
        if (request.getIsActive() != null) {
            parent.setActive(request.getIsActive());
            // Use save method that returns Parent
            parent = userService.save(parent);
        }
        // Ensure active status is not null
        parent = userService.ensureActiveStatus(parent);
        return ResponseEntity.ok(ApiResponse.success("Parent account updated successfully", parent));
    }
    
    @Operation(summary = "Update parent account with detailed information")
    @PatchMapping("/parents/{parentId}/update")
    public ResponseEntity<ApiResponse<Parent>> updateParentWithDetails(
            @PathVariable Long parentId, 
            @Valid @RequestBody UpdateParentRequest request) {
        // Call without casting
        Parent parent = userService.updateParent(
            parentId,
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getPhoneNumber(),
            request.getAddress(),
            request.getEmergencyContact(),
            request.getEmergencyPhone()
        );
        // Ensure parent is active if explicitly provided
        if (request.getIsActive() != null) {
            parent.setActive(request.getIsActive());
            // Use save method that returns Parent
            parent = userService.save(parent);
        }
        // Ensure active status is not null
        parent = userService.ensureActiveStatus(parent);
        return ResponseEntity.ok(ApiResponse.success("Parent account updated successfully", parent));
    }

    @Operation(summary = "Delete parent account")
    @DeleteMapping("/parents/{parentId}")
    public ResponseEntity<ApiResponse<Void>> deleteParent(@PathVariable Long parentId) {
        userService.deleteParent(parentId);
        return ResponseEntity.ok(ApiResponse.success("Parent account deleted successfully"));
    }
    
    @Operation(summary = "Toggle parent status")
    @PatchMapping("/parents/{parentId}/status")
    public ResponseEntity<ApiResponse<Parent>> toggleParentStatus(
            @PathVariable Long parentId, 
            @RequestParam boolean isActive) {
        Parent parent = userService.toggleParentStatus(parentId, isActive);
        return ResponseEntity.ok(ApiResponse.success(
            isActive ? "Parent account activated successfully" : "Parent account deactivated successfully", 
            parent));
    }

    @Operation(summary = "Create a new driver account")
    @PostMapping("/drivers")
    public ResponseEntity<ApiResponse<Driver>> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        Driver driver = userService.createDriver(
            request.getFirstName(), request.getLastName(), request.getEmail(),
            request.getPassword(), request.getPhoneNumber(), request.getLicenseNumber(),
            request.getLicenseExpiryDate(), request.getSchoolId(), request.getVehicleId(),
            request.getUsername()
        );
        return ResponseEntity.ok(ApiResponse.success("Driver account created successfully", driver));
    }

    @Operation(summary = "Create a new student")
    @PostMapping("/students")
    public ResponseEntity<ApiResponse<Student>> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        Student student = userService.createStudent(
            request.getFirstName(), request.getLastName(), request.getDateOfBirth(),
            request.getParentId(), request.getSchoolId(), request.getSeatNumber()
        );
        return ResponseEntity.ok(ApiResponse.success("Student created successfully", student));
    }

    // School Management

    @Operation(summary = "Create a new school")
    @PostMapping("/schools")
    public ResponseEntity<ApiResponse<School>> createSchool(@Valid @RequestBody SchoolRequest request) {
        School school = schoolService.createSchool(request);
        return ResponseEntity.ok(ApiResponse.success("School created successfully", school));
    }

    @Operation(summary = "Update a school")
    @PutMapping("/schools/{schoolId}")
    public ResponseEntity<ApiResponse<School>> updateSchool(@PathVariable Long schoolId, @Valid @RequestBody SchoolRequest request) {
        School school = schoolService.updateSchool(schoolId, request);
        return ResponseEntity.ok(ApiResponse.success("School updated successfully", school));
    }

    @Operation(summary = "Get all schools")
    @GetMapping("/schools")
    public ResponseEntity<ApiResponse<List<School>>> getAllSchools() {
        return ResponseEntity.ok(ApiResponse.success(schoolService.findAllActive()));
    }

    @Operation(summary = "Get school details")
    @GetMapping("/schools/{schoolId}")
    public ResponseEntity<ApiResponse<School>> getSchool(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(schoolService.findById(schoolId)));
    }

    // Route Management
    @Operation(summary = "Get routes by school")
    @GetMapping("/schools/{schoolId}/routes")
    public ResponseEntity<ApiResponse<List<Route>>> getSchoolRoutes(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(routeService.findBySchoolId(schoolId)));
    }

    // Trip Tracking
    @Operation(summary = "Get active trips")
    @GetMapping("/trips/active")
    public ResponseEntity<ApiResponse<List<Trip>>> getActiveTrips() {
        return ResponseEntity.ok(ApiResponse.success(tripService.findActiveTrips()));
    }

    @Operation(summary = "Get trip details")
    @GetMapping("/trips/{tripId}")
    public ResponseEntity<ApiResponse<Trip>> getTripDetails(@PathVariable Long tripId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.findByIdWithDetails(tripId)));
    }

    // Vehicle Management
    @Operation(summary = "Get all vehicles")
    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAllVehicles() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findAllActive()));
    }

    @Operation(summary = "Get vehicle details")
    @GetMapping("/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<Vehicle>> getVehicleDetails(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findById(vehicleId)));
    }

    @PostMapping("/vehicles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Vehicle>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        Vehicle vehicle = adminService.createVehicle(request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle created successfully", vehicle));
    }

    // Attendance Management
    @Operation(summary = "Get school attendance")
    @GetMapping("/schools/{schoolId}/attendance")
    public ResponseEntity<ApiResponse<List<Attendance>>> getSchoolAttendance(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(
            attendanceService.findSchoolAttendanceInPeriod(schoolId, start, end)
        ));
    }

    // Statistics
    @Operation(summary = "Get school statistics")
    @GetMapping("/schools/{schoolId}/stats")
    public ResponseEntity<ApiResponse<Object>> getSchoolStats(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        long activeStudents = schoolService.countActiveStudents(schoolId);
        long activeRoutes = schoolService.countActiveRoutes(schoolId);
        long activeDrivers = schoolService.countActiveDrivers(schoolId);
        long activeVehicles = schoolService.countActiveVehicles(schoolId);

        return ResponseEntity.ok(ApiResponse.success("School statistics retrieved successfully",
            List.of(
                "activeStudents", activeStudents,
                "activeRoutes", activeRoutes,
                "activeDrivers", activeDrivers,
                "activeVehicles", activeVehicles
            )
        ));
    }

    // Driver Management
    @Operation(summary = "Get available drivers")
    @GetMapping("/drivers/available")
    public ResponseEntity<ApiResponse<List<Driver>>> getAvailableDrivers() {
        return ResponseEntity.ok(ApiResponse.success(driverService.findAvailableDrivers()));
    }

    @Operation(summary = "Assign vehicle to driver")
    @PostMapping("/drivers/{driverId}/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<Void>> assignVehicleToDriver(
            @PathVariable Long driverId,
            @PathVariable Long vehicleId) {
        driverService.assignVehicle(driverId, vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle assigned successfully"));
    }

    // Student Management
    @Operation(summary = "Search students")
    @GetMapping("/students/search")
    public ResponseEntity<ApiResponse<List<Student>>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(studentService.searchStudents(query)));
    }

    @Operation(summary = "Get student attendance stats")
    @GetMapping("/students/{studentId}/attendance/stats")
    public ResponseEntity<ApiResponse<Double>> getStudentAttendanceStats(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        double percentage = studentService.calculateAttendancePercentage(studentId, start, end);
        return ResponseEntity.ok(ApiResponse.success(percentage));
    }
} 