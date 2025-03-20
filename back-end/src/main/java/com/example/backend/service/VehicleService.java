package com.example.backend.service;

import com.example.backend.entities.Vehicle;
import com.example.backend.service.base.BaseService;

import java.util.List;
import java.util.Optional;

public interface VehicleService extends BaseService<Vehicle> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    List<Vehicle> findByAvailable(boolean available);
    Optional<Vehicle> findByIdWithDriver(Long vehicleId);
    List<Vehicle> findAvailableVehicles();
    List<Vehicle> findVehiclesBySchool(Long schoolId);
    List<Vehicle> findNearbyVehicles(Double latitude, Double longitude, Double radiusInMeters);
    List<Vehicle> findActivelyOperatingVehicles();
    long countCompletedTrips(Long vehicleId);
    void updateLocation(Long vehicleId, Double latitude, Double longitude);
    void markAsAvailable(Long vehicleId);
    void markAsUnavailable(Long vehicleId);
    void assignToSchool(Long vehicleId, Long schoolId);
    void removeFromSchool(Long vehicleId);
    void performMaintenance(Long vehicleId, String maintenanceType, String notes);
    void completeMaintenance(Long vehicleId, String notes);
    List<Vehicle> findVehiclesWithStats();
} 