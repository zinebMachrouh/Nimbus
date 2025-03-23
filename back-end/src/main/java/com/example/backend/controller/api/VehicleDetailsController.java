package com.example.backend.controller.api;

import com.example.backend.dto.vehicle.VehicleDetailsDTO;
import com.example.backend.entities.Vehicle;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.mapper.VehicleDetailsMapper;
import com.example.backend.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vehicle-details")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Vehicle Details", description = "Vehicle details operations")
public class VehicleDetailsController {

    private final VehicleService vehicleService;
    private final VehicleDetailsMapper vehicleDetailsMapper;

    @GetMapping
    @Operation(summary = "Get all vehicles with details", description = "Retrieve detailed information for all vehicles")
    public ResponseEntity<List<VehicleDetailsDTO>> getAllVehicles() {
        log.debug("REST request to get all vehicles with details");
        List<Vehicle> vehicles = vehicleService.findAll();
        List<VehicleDetailsDTO> dtos = vehicles.stream()
                .map(vehicleDetailsMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle details by ID", description = "Retrieve detailed information for a specific vehicle")
    public ResponseEntity<VehicleDetailsDTO> getVehicleById(@PathVariable Long id) {
        log.debug("REST request to get vehicle details by id: {}", id);
        try {
            Vehicle vehicle = vehicleService.findById(id);
            VehicleDetailsDTO dto = vehicleDetailsMapper.toDto(vehicle);
            return ResponseEntity.ok(dto);
        } catch (EntityNotFoundException ex) {
            log.warn("Vehicle not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/school/{schoolId}")
    @Operation(summary = "Get vehicles by school", description = "Retrieve detailed information for all vehicles associated with a school")
    public ResponseEntity<List<VehicleDetailsDTO>> getVehiclesBySchool(@PathVariable Long schoolId) {
        log.debug("REST request to get vehicles for school: {}", schoolId);
        List<Vehicle> vehicles = vehicleService.findVehiclesBySchool(schoolId);
        List<VehicleDetailsDTO> dtos = vehicles.stream()
                .map(vehicleDetailsMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/available")
    @Operation(summary = "Get available vehicles", description = "Retrieve detailed information for all available vehicles")
    public ResponseEntity<List<VehicleDetailsDTO>> getAvailableVehicles() {
        log.debug("REST request to get all available vehicles");
        List<Vehicle> vehicles = vehicleService.findAvailableVehicles();
        List<VehicleDetailsDTO> dtos = vehicles.stream()
                .map(vehicleDetailsMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get vehicles with statistics", description = "Retrieve vehicles with statistical information")
    public ResponseEntity<List<VehicleDetailsDTO>> getVehiclesWithStats() {
        log.debug("REST request to get vehicles with statistics");
        List<Vehicle> vehicles = vehicleService.findVehiclesWithStats();
        List<VehicleDetailsDTO> dtos = vehicles.stream()
                .map(vehicleDetailsMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get nearby vehicles", description = "Find vehicles within a specified radius of coordinates")
    public ResponseEntity<List<VehicleDetailsDTO>> findNearbyVehicles(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Double radius) {
        log.debug("REST request to find vehicles near ({}, {}) within {} meters", latitude, longitude, radius);
        List<Vehicle> vehicles = vehicleService.findNearbyVehicles(latitude, longitude, radius);
        List<VehicleDetailsDTO> dtos = vehicles.stream()
                .map(vehicleDetailsMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
} 