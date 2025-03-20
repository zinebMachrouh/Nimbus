package com.example.backend.service.impl;

import com.example.backend.entities.School;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Driver;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.service.DriverService;
import com.example.backend.service.base.BaseServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class DriverServiceImpl extends BaseServiceImpl<Driver, DriverRepository> implements DriverService {

    private final VehicleRepository vehicleRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;

    public DriverServiceImpl(DriverRepository repository,
                           VehicleRepository vehicleRepository,
                           SchoolRepository schoolRepository,
                           PasswordEncoder passwordEncoder) {
        super(repository);
        this.vehicleRepository = vehicleRepository;
        this.schoolRepository = schoolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<Driver> findByAvailable(boolean available) {
        log.debug("Finding drivers by availability: {}", available);
        return available ? repository.findAvailableDrivers() : repository.findByStatus(Driver.DriverStatus.OFF_DUTY.name());
    }

    @Override
    public Optional<Driver> findByLicenseNumber(String licenseNumber) {
        log.debug("Finding driver by license number: {}", licenseNumber);
        return repository.findByLicenseNumber(licenseNumber);
    }

    @Override
    public Optional<Driver> findByIdWithCurrentTrips(Long driverId) {
        log.debug("Finding driver {} with current trips", driverId);
        return repository.findByIdWithCurrentTrips(driverId);
    }

    @Override
    public List<Driver> findAvailableDrivers() {
        log.debug("Finding all available drivers");
        return repository.findAvailableDrivers();
    }

    @Override
    public long countCompletedTripsInPeriod(Long driverId, LocalDateTime start, LocalDateTime end) {
        log.debug("Counting completed trips for driver {} between {} and {}", driverId, start, end);
        validateDriverExists(driverId);
        validateTimeRange(start, end);
        return repository.countCompletedTripsInPeriod(driverId, start, end);
    }

    @Override
    public List<Driver> findDriversBySchool(Long schoolId) {
        log.debug("Finding drivers for school {}", schoolId);
        validateSchoolExists(schoolId);
        return repository.findBySchoolId(schoolId);
    }

    @Override
    public List<Driver> findAllActiveWithLocation() {
        log.debug("Finding all active drivers with location");
        return repository.findAllActiveWithLocation();
    }

    @Override
    @Transactional
    public void assignVehicle(Long driverId, Long vehicleId) {
        log.debug("Assigning vehicle {} to driver {}", vehicleId, driverId);
        Driver driver = findDriverById(driverId);
        Vehicle vehicle = findVehicleById(vehicleId);
        
        if (driver.getVehicle() != null) {
            if (driver.getVehicle().getId().equals(vehicleId)) {
                throw new ValidationException("Vehicle is already assigned to this driver");
            }
            throw new ValidationException("Driver already has a vehicle assigned");
        }

        if (vehicle.getDriver() != null) {
            throw new ValidationException("Vehicle is already assigned to another driver");
        }

        driver.setVehicle(vehicle);
        vehicle.setDriver(driver);
        vehicle.setStatus(Vehicle.VehicleStatus.IN_USE);
        repository.save(driver);
        vehicleRepository.save(vehicle);
        log.info("Successfully assigned vehicle {} to driver {}", vehicleId, driverId);
    }

    @Override
    @Transactional
    public void unassignVehicle(Long driverId) {
        log.debug("Unassigning vehicle from driver {}", driverId);
        Driver driver = findDriverById(driverId);
        
        if (driver.getVehicle() == null) {
            throw new ValidationException("Driver has no vehicle assigned");
        }

        Vehicle vehicle = driver.getVehicle();
        driver.setVehicle(null);
        vehicle.setDriver(null);
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        repository.save(driver);
        vehicleRepository.save(vehicle);
        log.info("Successfully unassigned vehicle from driver {}", driverId);
    }

    @Override
    @Transactional
    public void updateLocation(Long driverId, Double latitude, Double longitude) {
        log.debug("Updating location for driver {} to ({}, {})", driverId, latitude, longitude);
        Driver driver = findDriverById(driverId);
        
        if (latitude == null || longitude == null) {
            throw new ValidationException("Latitude and longitude are required");
        }

        driver.setCurrentLatitude(latitude);
        driver.setCurrentLongitude(longitude);
        repository.save(driver);
        log.info("Successfully updated location for driver {}", driverId);
    }

    @Override
    @Transactional
    public void markAsAvailable(Long driverId) {
        log.debug("Marking driver {} as available", driverId);
        Driver driver = findDriverById(driverId);
        driver.setStatus(Driver.DriverStatus.AVAILABLE);
        repository.save(driver);
        log.info("Successfully marked driver {} as available", driverId);
    }

    @Override
    @Transactional
    public void markAsUnavailable(Long driverId) {
        log.debug("Marking driver {} as unavailable", driverId);
        Driver driver = findDriverById(driverId);
        driver.setStatus(Driver.DriverStatus.OFF_DUTY);
        repository.save(driver);
        log.info("Successfully marked driver {} as unavailable", driverId);
    }

    @Override
    @Transactional
    public Driver createDriver(Driver driver) {
        log.debug("Creating new driver: {}", driver.getEmail());
        
        validateDriverData(driver);
        
        if (repository.existsByEmail(driver.getEmail())) {
            throw new ValidationException("email", "Email already exists");
        }
        if (repository.existsByLicenseNumber(driver.getLicenseNumber())) {
            throw new ValidationException("licenseNumber", "License number already exists");
        }

        driver.setPassword(passwordEncoder.encode(driver.getPassword()));
        driver.setRole(Driver.Role.DRIVER);
        driver.setActive(true);
        driver.setStatus(Driver.DriverStatus.AVAILABLE);
        
        Driver savedDriver = repository.save(driver);
        log.info("Successfully created driver with id: {}", savedDriver.getId());
        return savedDriver;
    }

    @Override
    @Transactional
    public void updateDriverProfile(Long driverId, Driver updatedDriver) {
        log.debug("Updating driver profile for id: {}", driverId);
        Driver driver = findDriverById(driverId);
        
        validateDriverData(updatedDriver);
        
        if (!driver.getEmail().equals(updatedDriver.getEmail()) && 
            repository.existsByEmail(updatedDriver.getEmail())) {
            throw new ValidationException("email", "Email already exists");
        }
        if (!driver.getLicenseNumber().equals(updatedDriver.getLicenseNumber()) && 
            repository.existsByLicenseNumber(updatedDriver.getLicenseNumber())) {
            throw new ValidationException("licenseNumber", "License number already exists");
        }

        driver.setFirstName(updatedDriver.getFirstName());
        driver.setLastName(updatedDriver.getLastName());
        driver.setEmail(updatedDriver.getEmail());
        driver.setPhoneNumber(updatedDriver.getPhoneNumber());
        driver.setLicenseNumber(updatedDriver.getLicenseNumber());
        driver.setLicenseExpiryDate(updatedDriver.getLicenseExpiryDate());
        
        if (StringUtils.hasText(updatedDriver.getPassword())) {
            driver.setPassword(passwordEncoder.encode(updatedDriver.getPassword()));
        }

        repository.save(driver);
        log.info("Successfully updated driver profile for id: {}", driverId);
    }

    @Override
    public Vehicle getCurrentVehicle() {
        Long driverId = getCurrentDriverId();
        Driver driver = findDriverById(driverId);
        return driver.getVehicle();
    }

    @Override
    public Long getCurrentDriverId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return repository.findByEmail(email)
                .map(Driver::getId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    @Override
    @Transactional
    public void updateProfile(Long driverId, String phoneNumber, String licenseNumber, LocalDateTime licenseExpiryDate) {
        log.debug("Updating profile for driver {}", driverId);
        Driver driver = findDriverById(driverId);
        
        if (StringUtils.hasText(phoneNumber)) {
            driver.setPhoneNumber(phoneNumber);
        }
        if (StringUtils.hasText(licenseNumber)) {
            driver.setLicenseNumber(licenseNumber);
        }
        if (licenseExpiryDate != null) {
            driver.setLicenseExpiryDate(licenseExpiryDate);
        }
        
        repository.save(driver);
        log.info("Successfully updated profile for driver {}", driverId);
    }

    @Override
    public List<Driver> findByStatus(String status) {
        log.debug("Finding drivers by status: {}", status);
        validateDriverStatus(status);
        return repository.findByStatus(status);
    }

    @Override
    public List<Driver> findByVehicleId(Long vehicleId) {
        log.debug("Finding drivers by vehicle ID: {}", vehicleId);
        validateVehicleExists(vehicleId);
        return repository.findByVehicleId(vehicleId);
    }

    @Override
    public List<Driver> findBySchoolId(Long schoolId) {
        log.debug("Finding drivers by school ID: {}", schoolId);
        validateSchoolExists(schoolId);
        return repository.findBySchoolId(schoolId);
    }

    // Private helper methods
    private void validateDriverData(Driver driver) {
        if (!StringUtils.hasText(driver.getFirstName())) {
            throw new ValidationException("firstName", "First name is required");
        }
        if (!StringUtils.hasText(driver.getLastName())) {
            throw new ValidationException("lastName", "Last name is required");
        }
        if (!StringUtils.hasText(driver.getEmail())) {
            throw new ValidationException("email", "Email is required");
        }
        if (!StringUtils.hasText(driver.getPhoneNumber())) {
            throw new ValidationException("phoneNumber", "Phone number is required");
        }
        if (!StringUtils.hasText(driver.getLicenseNumber())) {
            throw new ValidationException("licenseNumber", "License number is required");
        }
        if (driver.getLicenseExpiryDate() == null) {
            throw new ValidationException("licenseExpiryDate", "License expiry date is required");
        }
        if (driver.getLicenseExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ValidationException("licenseExpiryDate", "License has expired");
        }
        if (driver.getId() == null && !StringUtils.hasText(driver.getPassword())) {
            throw new ValidationException("password", "Password is required");
        }
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new ValidationException("Time range cannot be null");
        }
        if (startTime.isAfter(endTime)) {
            throw new ValidationException("Start time cannot be after end time");
        }
    }

    private void validateSchoolExists(Long schoolId) {
        if (!schoolRepository.existsById(schoolId)) {
            throw new EntityNotFoundException("School not found with id: " + schoolId);
        }
    }

    private void validateDriverExists(Long driverId) {
        if (!repository.existsById(driverId)) {
            throw new EntityNotFoundException("Driver", driverId);
        }
    }

    private Driver findDriverById(Long driverId) {
        return repository.findById(driverId)
                .orElseThrow(() -> new EntityNotFoundException("Driver", driverId));
    }

    private Vehicle findVehicleById(Long vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle", vehicleId));
    }

    private School findSchoolById(Long schoolId) {
        return schoolRepository.findById(schoolId)
                .orElseThrow(() -> new EntityNotFoundException("School", schoolId));
    }

    private void validateDriverStatus(String status) {
        try {
            Driver.DriverStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid driver status: " + status);
        }
    }

    private void validateVehicleExists(Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new EntityNotFoundException("Vehicle not found with id: " + vehicleId);
        }
    }
} 