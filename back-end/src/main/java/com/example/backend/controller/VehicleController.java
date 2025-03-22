package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.vehicle.VehicleRequest;
import com.example.backend.entities.Vehicle;
import com.example.backend.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Vehicle management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class VehicleController {
    private final VehicleService vehicleService;

    @Operation(summary = "Get all vehicles")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAllVehicles() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findAll()));
    }

    @Operation(summary = "Get vehicle by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Vehicle>> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findById(id)));
    }

    @Operation(summary = "Create a new vehicle")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Vehicle>> createVehicle(@Valid @RequestBody VehicleRequest vehicleRequest) {
        Vehicle vehicle = new Vehicle();
        vehicle.setMake(vehicleRequest.getMake());
        vehicle.setModel(vehicleRequest.getModel());
        vehicle.setYear(vehicleRequest.getYear());
        vehicle.setLicensePlate(vehicleRequest.getVehicleNumber());
        vehicle.setCapacity(vehicleRequest.getCapacity());
        vehicle.setInsuranceExpiryDate(vehicleRequest.getInsuranceExpiryDate());
        vehicle.setRegistrationExpiryDate(vehicleRequest.getRegistrationExpiryDate());
        vehicle.setLastMaintenanceDate(vehicleRequest.getLastMaintenanceDate());
        vehicle.setCurrentMileage(vehicleRequest.getCurrentMileage());
        vehicle.setCurrentLatitude(vehicleRequest.getInitialLatitude());
        vehicle.setCurrentLongitude(vehicleRequest.getInitialLongitude());
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        vehicle.setActive(true);
        
        // Save the vehicle to generate ID
        Vehicle savedVehicle = vehicleService.save(vehicle);
        
        // If schoolId is provided, assign school to vehicle
        if (vehicleRequest.getSchoolId() != null) {
            vehicleService.assignToSchool(savedVehicle.getId(), vehicleRequest.getSchoolId());
            // Reload the vehicle to get updated data including school
            savedVehicle = vehicleService.findById(savedVehicle.getId());
        }
        
        return ResponseEntity.ok(ApiResponse.success(savedVehicle));
    }

    @Operation(summary = "Update a vehicle")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Vehicle>> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequest vehicleRequest) {
        Vehicle vehicle = vehicleService.findById(id);
        vehicle.setMake(vehicleRequest.getMake());
        vehicle.setModel(vehicleRequest.getModel());
        vehicle.setYear(vehicleRequest.getYear());
        vehicle.setLicensePlate(vehicleRequest.getVehicleNumber());
        vehicle.setCapacity(vehicleRequest.getCapacity());
        vehicle.setInsuranceExpiryDate(vehicleRequest.getInsuranceExpiryDate());
        vehicle.setRegistrationExpiryDate(vehicleRequest.getRegistrationExpiryDate());
        vehicle.setLastMaintenanceDate(vehicleRequest.getLastMaintenanceDate());
        vehicle.setCurrentMileage(vehicleRequest.getCurrentMileage());
        
        // Update location if provided
        if (vehicleRequest.getInitialLatitude() != null) {
            vehicle.setCurrentLatitude(vehicleRequest.getInitialLatitude());
        }
        if (vehicleRequest.getInitialLongitude() != null) {
            vehicle.setCurrentLongitude(vehicleRequest.getInitialLongitude());
        }
        
        return ResponseEntity.ok(ApiResponse.success(vehicleService.save(vehicle)));
    }

    @Operation(summary = "Delete a vehicle")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.softDeleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find vehicle by license plate")
    @GetMapping("/license-plate/{licensePlate}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Vehicle>> findByLicensePlate(@PathVariable String licensePlate) {
        Optional<Vehicle> vehicle = vehicleService.findByLicensePlate(licensePlate);
        return vehicle.map(v -> ResponseEntity.ok(ApiResponse.success(v)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Find available vehicles")
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Vehicle>>> findAvailableVehicles() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findAvailableVehicles()));
    }

    @Operation(summary = "Find vehicles by school")
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Vehicle>>> findVehiclesBySchool(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findVehiclesBySchool(schoolId)));
    }

    @Operation(summary = "Find nearby vehicles")
    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Vehicle>>> findNearbyVehicles(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Double radiusInMeters) {
        return ResponseEntity.ok(ApiResponse.success(
                vehicleService.findNearbyVehicles(latitude, longitude, radiusInMeters)));
    }

    @Operation(summary = "Find actively operating vehicles")
    @GetMapping("/operating")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Vehicle>>> findActivelyOperatingVehicles() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findActivelyOperatingVehicles()));
    }

    @Operation(summary = "Count completed trips for a vehicle")
    @GetMapping("/{id}/trips/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Long>> countCompletedTrips(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.countCompletedTrips(id)));
    }

    @Operation(summary = "Update vehicle location")
    @PutMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        vehicleService.updateLocation(id, latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Mark vehicle as available")
    @PutMapping("/{id}/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> markAsAvailable(@PathVariable Long id) {
        vehicleService.markAsAvailable(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Mark vehicle as unavailable")
    @PutMapping("/{id}/unavailable")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Void>> markAsUnavailable(@PathVariable Long id) {
        vehicleService.markAsUnavailable(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Assign vehicle to school")
    @PutMapping("/{id}/assign-school/{schoolId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignToSchool(
            @PathVariable Long id,
            @PathVariable Long schoolId) {
        vehicleService.assignToSchool(id, schoolId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Remove vehicle from school")
    @PutMapping("/{id}/remove-school")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeFromSchool(@PathVariable Long id) {
        vehicleService.removeFromSchool(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Perform maintenance on vehicle")
    @PostMapping("/{id}/maintenance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> performMaintenance(
            @PathVariable Long id,
            @RequestParam String maintenanceType,
            @RequestParam String notes) {
        vehicleService.performMaintenance(id, maintenanceType, notes);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Complete maintenance on vehicle")
    @PostMapping("/{id}/maintenance/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> completeMaintenance(
            @PathVariable Long id,
            @RequestParam String notes) {
        vehicleService.completeMaintenance(id, notes);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Get vehicles with statistics")
    @GetMapping("/with-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Vehicle>>> findVehiclesWithStats() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.findVehiclesWithStats()));
    }
} 