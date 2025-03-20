package com.example.backend.service.impl;

import com.example.backend.entities.School;
import com.example.backend.entities.Vehicle;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.service.VehicleService;
import com.example.backend.service.base.BaseServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class VehicleServiceImpl extends BaseServiceImpl<Vehicle, VehicleRepository> implements VehicleService {

    private final SchoolRepository schoolRepository;

    public VehicleServiceImpl(VehicleRepository repository, SchoolRepository schoolRepository) {
        super(repository);
        this.schoolRepository = schoolRepository;
    }

    @Override
    public Optional<Vehicle> findByLicensePlate(String licensePlate) {
        log.debug("Finding vehicle by license plate: {}", licensePlate);
        return repository.findByLicensePlateAndActiveTrue(licensePlate);
    }

    @Override
    public List<Vehicle> findByAvailable(boolean available) {
        log.debug("Finding vehicles by availability: {}", available);
        return repository.findAvailableAndActiveVehicles();
    }

    @Override
    public Optional<Vehicle> findByIdWithDriver(Long vehicleId) {
        log.debug("Finding vehicle {} with driver", vehicleId);
        return repository.findByIdWithDriver(vehicleId);
    }

    @Override
    public List<Vehicle> findAvailableVehicles() {
        log.debug("Finding all available vehicles");
        return repository.findAvailableVehicles();
    }

    @Override
    public List<Vehicle> findVehiclesBySchool(Long schoolId) {
        log.debug("Finding vehicles for school {}", schoolId);
        validateSchoolExists(schoolId);
        return repository.findVehiclesBySchool(schoolId);
    }

    @Override
    public List<Vehicle> findNearbyVehicles(Double latitude, Double longitude, Double radiusInMeters) {
        log.debug("Finding vehicles near ({}, {}) within {} meters", latitude, longitude, radiusInMeters);
        validateCoordinates(latitude, longitude);
        if (radiusInMeters == null || radiusInMeters <= 0) {
            throw new ValidationException("radius", "Radius must be greater than 0");
        }
        return repository.findNearbyVehicles(latitude, longitude, radiusInMeters);
    }

    @Override
    public List<Vehicle> findActivelyOperatingVehicles() {
        log.debug("Finding actively operating vehicles");
        return repository.findActivelyOperatingVehicles();
    }

    @Override
    public long countCompletedTrips(Long vehicleId) {
        log.debug("Counting completed trips for vehicle {}", vehicleId);
        validateVehicleExists(vehicleId);
        return repository.countCompletedTrips(vehicleId);
    }

    @Override
    @Transactional
    public void updateLocation(Long vehicleId, Double latitude, Double longitude) {
        log.debug("Updating location for vehicle {} to ({}, {})", vehicleId, latitude, longitude);
        Vehicle vehicle = findVehicleById(vehicleId);
        validateCoordinates(latitude, longitude);

        vehicle.setCurrentLatitude(latitude);
        vehicle.setCurrentLongitude(longitude);

        repository.save(vehicle);
        log.info("Successfully updated location for vehicle {}", vehicleId);
    }

    @Override
    @Transactional
    public void markAsAvailable(Long vehicleId) {
        log.debug("Marking vehicle {} as available", vehicleId);
        Vehicle vehicle = findVehicleById(vehicleId);

        if (vehicle.getDriver() != null) {
            throw new ValidationException("Cannot mark vehicle as available while assigned to a driver");
        }
        if (vehicle.getStatus() == Vehicle.VehicleStatus.MAINTENANCE) {
            throw new ValidationException("Cannot mark vehicle as available while under maintenance");
        }

        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        repository.save(vehicle);
        log.info("Successfully marked vehicle {} as available", vehicleId);
    }

    @Override
    @Transactional
    public void markAsUnavailable(Long vehicleId) {
        log.debug("Marking vehicle {} as unavailable", vehicleId);
        Vehicle vehicle = findVehicleById(vehicleId);

        if (vehicle.getStatus() == Vehicle.VehicleStatus.IN_USE) {
            throw new ValidationException("Cannot mark vehicle as unavailable while in use");
        }
        if (vehicle.getStatus() == Vehicle.VehicleStatus.MAINTENANCE) {
            throw new ValidationException("Cannot mark vehicle as unavailable while under maintenance");
        }

        vehicle.setStatus(Vehicle.VehicleStatus.OUT_OF_SERVICE);
        repository.save(vehicle);
        log.info("Successfully marked vehicle {} as unavailable", vehicleId);
    }

    @Override
    @Transactional
    public void assignToSchool(Long vehicleId, Long schoolId) {
        log.debug("Assigning vehicle {} to school {}", vehicleId, schoolId);
        Vehicle vehicle = findVehicleById(vehicleId);
        School school = findSchoolById(schoolId);

        if (vehicle.getSchool() != null) {
            if (vehicle.getSchool().getId().equals(schoolId)) {
                throw new ValidationException("Vehicle is already assigned to this school");
            }
            throw new ValidationException("Vehicle is already assigned to another school");
        }

        vehicle.setSchool(school);
        repository.save(vehicle);
        log.info("Successfully assigned vehicle {} to school {}", vehicleId, schoolId);
    }

    @Override
    @Transactional
    public void removeFromSchool(Long vehicleId) {
        log.debug("Removing vehicle {} from school assignment", vehicleId);
        Vehicle vehicle = findVehicleById(vehicleId);

        if (vehicle.getSchool() == null) {
            throw new ValidationException("Vehicle is not assigned to any school");
        }

        vehicle.setSchool(null);
        repository.save(vehicle);
        log.info("Successfully removed vehicle {} from school assignment", vehicleId);
    }

    @Override
    @Transactional
    public void performMaintenance(Long vehicleId, String maintenanceType, String notes) {
        log.debug("Starting maintenance for vehicle {}: {}", vehicleId, maintenanceType);
        Vehicle vehicle = findVehicleById(vehicleId);

        if (vehicle.getStatus() == Vehicle.VehicleStatus.IN_USE) {
            throw new ValidationException("Cannot start maintenance while vehicle is in use");
        }
        if (vehicle.getStatus() == Vehicle.VehicleStatus.MAINTENANCE) {
            throw new ValidationException("Vehicle is already under maintenance");
        }
        if (!StringUtils.hasText(maintenanceType)) {
            throw new ValidationException("maintenanceType", "Maintenance type is required");
        }

        vehicle.setStatus(Vehicle.VehicleStatus.MAINTENANCE);
        repository.save(vehicle);
        log.info("Successfully started maintenance for vehicle {}", vehicleId);
    }

    @Override
    @Transactional
    public void completeMaintenance(Long vehicleId, String notes) {
        log.debug("Completing maintenance for vehicle {}", vehicleId);
        Vehicle vehicle = findVehicleById(vehicleId);

        if (vehicle.getStatus() != Vehicle.VehicleStatus.MAINTENANCE) {
            throw new ValidationException("Vehicle is not under maintenance");
        }

        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        vehicle.setLastMaintenanceDate(LocalDateTime.now().toLocalDate());
        repository.save(vehicle);
        log.info("Successfully completed maintenance for vehicle {}", vehicleId);
    }

    @Override
    public List<Vehicle> findVehiclesWithStats() {
        log.debug("Finding vehicles with statistics");
        List<Vehicle> vehicles = repository.findAllByActiveTrue();
        vehicles.forEach(vehicle -> {
            vehicle.setCompletedTripsCount(countCompletedTrips(vehicle.getId()));
        });
        return vehicles;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.debug("Deleting vehicle {}", id);
        Vehicle vehicle = findVehicleById(id);
        
        if (vehicle.getStatus() == Vehicle.VehicleStatus.IN_USE) {
            throw new ValidationException("Cannot delete vehicle while it is in use");
        }
        if (vehicle.getDriver() != null) {
            throw new ValidationException("Cannot delete vehicle while assigned to a driver");
        }

        repository.delete(vehicle);
        log.info("Successfully deleted vehicle {}", id);
    }

    // These methods are not applicable for vehicles
    @Override
    public Vehicle createDriver(Vehicle entity) {
        throw new UnsupportedOperationException("Operation not supported for vehicles");
    }

    @Override
    public void updateDriverProfile(Long id, Vehicle entity) {
        throw new UnsupportedOperationException("Operation not supported for vehicles");
    }

    // Private helper methods
    private void validateCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new ValidationException("Latitude and longitude are required");
        }
        if (latitude < -90 || latitude > 90) {
            throw new ValidationException("latitude", "Invalid latitude value");
        }
        if (longitude < -180 || longitude > 180) {
            throw new ValidationException("longitude", "Invalid longitude value");
        }
    }

    private void validateSchoolExists(Long schoolId) {
        if (!schoolRepository.existsById(schoolId)) {
            throw new EntityNotFoundException("School", schoolId);
        }
    }

    private void validateVehicleExists(Long vehicleId) {
        if (!repository.existsById(vehicleId)) {
            throw new EntityNotFoundException("Vehicle", vehicleId);
        }
    }

    private Vehicle findVehicleById(Long vehicleId) {
        return repository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle", vehicleId));
    }

    private School findSchoolById(Long schoolId) {
        return schoolRepository.findById(schoolId)
                .orElseThrow(() -> new EntityNotFoundException("School", schoolId));
    }
} 