package com.example.backend.service;

import com.example.backend.entities.user.Driver;
import com.example.backend.entities.Vehicle;
import com.example.backend.service.base.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DriverService extends BaseService<Driver> {
    List<Driver> findByAvailable(boolean available);
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    Optional<Driver> findByIdWithCurrentTrips(Long driverId);
    List<Driver> findAvailableDrivers();
    long countCompletedTripsInPeriod(Long driverId, LocalDateTime start, LocalDateTime end);
    List<Driver> findDriversBySchool(Long schoolId);
    List<Driver> findAllActiveWithLocation();
    void assignVehicle(Long driverId, Long vehicleId);
    void unassignVehicle(Long driverId);
    void updateLocation(Long driverId, Double latitude, Double longitude);
    void markAsAvailable(Long driverId);
    void markAsUnavailable(Long driverId);
    Driver findById(Long id);
    List<Driver> findBySchoolId(Long schoolId);
    List<Driver> findByVehicleId(Long vehicleId);
    List<Driver> findByStatus(String status);
    Driver save(Driver driver);
    void delete(Long id);
    Vehicle getCurrentVehicle();
    void updateProfile(Long driverId, String phoneNumber, String licenseNumber, LocalDateTime licenseExpiryDate);
    Long getCurrentDriverId();
} 