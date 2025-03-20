package com.example.backend.service.impl;

import com.example.backend.entities.Trip;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.Route;
import com.example.backend.entities.user.Driver;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.repository.RouteRepository;
import com.example.backend.service.TripService;
import com.example.backend.service.base.BaseServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TripServiceImpl extends BaseServiceImpl<Trip, TripRepository> implements TripService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;

    // Constants for business rules
    private static final int MIN_TRIP_DURATION_MINUTES = 15;
    private static final int MAX_TRIP_DURATION_HOURS = 4;
    private static final int MIN_SCHEDULE_ADVANCE_HOURS = 1;
    private static final int MAX_SCHEDULE_ADVANCE_DAYS = 30;

    public TripServiceImpl(TripRepository repository,
                          DriverRepository driverRepository,
                          VehicleRepository vehicleRepository,
                          RouteRepository routeRepository) {
        super(repository);
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
    }

    @Override
    public List<Trip> findByDriverId(Long driverId) {
        validateDriverExists(driverId);
        return repository.findByDriverIdAndActiveTrue(driverId);
    }

    @Override
    public List<Trip> findByVehicleId(Long vehicleId) {
        validateVehicleExists(vehicleId);
        return repository.findByVehicleIdAndActiveTrue(vehicleId);
    }

    @Override
    public List<Trip> findByRouteId(Long routeId) {
        validateRouteExists(routeId);
        return repository.findByRouteIdAndActiveTrue(routeId);
    }

    @Override
    public List<Trip> findUpcomingTrips(LocalDateTime start, LocalDateTime end) {
        validateDateRange(start, end);
        return repository.findUpcomingTrips(start, end);
    }

    @Override
    public List<Trip> findActiveTrips() {
        return repository.findActiveTrips();
    }

    @Override
    public List<Trip> findUpcomingTripsByDriver(Long driverId) {
        validateDriverExists(driverId);
        return repository.findUpcomingTripsByDriver(driverId);
    }

    @Override
    public long countActiveTripsForSchool(Long schoolId) {
        validateSchoolExists(schoolId);
        return repository.countActiveTripsForSchool(schoolId);
    }

    @Override
    @Transactional
    public void assignDriver(Long tripId, Long driverId) {
        log.debug("Assigning driver {} to trip {}", driverId, tripId);
        
        Trip trip = findTripById(tripId);
        Driver driver = findDriverById(driverId);
        
        validateDriverAssignment(driver, trip);

        trip.setDriver(driver);
        repository.save(trip);
        log.info("Successfully assigned driver {} to trip {}", driverId, tripId);
    }

    @Override
    @Transactional
    public void assignVehicle(Long tripId, Long vehicleId) {
        log.debug("Assigning vehicle {} to trip {}", vehicleId, tripId);
        
        Trip trip = findTripById(tripId);
        Vehicle vehicle = findVehicleById(vehicleId);
        
        validateVehicleAssignment(vehicle, trip);

        trip.setVehicle(vehicle);
        repository.save(trip);
        log.info("Successfully assigned vehicle {} to trip {}", vehicleId, tripId);
    }

    @Override
    @Transactional
    public void updateTripStatus(Long tripId, String status) {
        log.debug("Updating trip {} status to {}", tripId, status);
        
        Trip trip = findTripById(tripId);
        validateTripStatus(status);
        validateStatusUpdate(trip, Trip.TripStatus.valueOf(status));

        trip.setStatus(Trip.TripStatus.valueOf(status));
        repository.save(trip);
        log.info("Successfully updated trip {} status to {}", tripId, status);
    }

    @Override
    @Transactional
    public void updateTripSchedule(Long tripId, LocalDateTime departureTime, LocalDateTime estimatedArrivalTime) {
        log.debug("Updating schedule for trip {}", tripId);
        
        Trip trip = findTripById(tripId);
        validateScheduleUpdate(trip, departureTime);

        trip.setScheduledDepartureTime(departureTime);
        repository.save(trip);
        log.info("Successfully updated schedule for trip {}", tripId);
    }

    @Override
    @Transactional
    public void startTrip(Long tripId) {
        log.debug("Starting trip {}", tripId);
        
        Trip trip = findTripById(tripId);
        validateTripStart(trip);

        trip.setStatus(Trip.TripStatus.IN_PROGRESS);
        trip.setActualDepartureTime(LocalDateTime.now());
        repository.save(trip);
        log.info("Successfully started trip {}", tripId);
    }

    @Override
    @Transactional
    public void completeTrip(Long tripId) {
        log.debug("Completing trip {}", tripId);
        
        Trip trip = findTripById(tripId);
        validateTripCompletion(trip);

        trip.setStatus(Trip.TripStatus.COMPLETED);
        trip.setActualArrivalTime(LocalDateTime.now());
        repository.save(trip);
        log.info("Successfully completed trip {}", tripId);
    }

    @Override
    @Transactional
    public void cancelTrip(Long tripId, String reason) {
        log.debug("Canceling trip {} with reason: {}", tripId, reason);
        
        Trip trip = findTripById(tripId);
        validateTripCancellation(trip);
        validateCancellationReason(reason);

        trip.setStatus(Trip.TripStatus.CANCELLED);
        trip.setNotes(reason);
        repository.save(trip);
        log.info("Successfully canceled trip {}", tripId);
    }

    @Override
    public List<Trip> findTripsWithStats(Long schoolId, LocalDateTime start, LocalDateTime end) {
        log.debug("Finding trips with statistics for school {} between {} and {}", schoolId, start, end);
        
        validateSchoolExists(schoolId);
        validateDateRange(start, end);
        
        return repository.findUpcomingTrips(start, end).stream()
            .filter(trip -> trip.getRoute().getSchool().getId().equals(schoolId))
            .toList();
    }

    @Override
    public List<Trip> findTripsByStudentId(Long studentId, int page, int size) {
        log.debug("Finding trips for student {} with pagination", studentId);
        validateStudentExists(studentId);
        return repository.findTripsByStudentId(studentId, page, size);
    }

    @Override
    public Trip findByIdWithDetails(Long tripId) {
        log.debug("Finding trip {} with details", tripId);
        return repository.findByIdWithDetails(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with id: " + tripId));
    }

    @Override
    @Transactional
    public Trip createAndStartTrip(Long routeId) {
        log.debug("Creating and starting trip for route {}", routeId);
        validateRouteExists(routeId);
        
        Trip trip = new Trip();
        trip.setRoute(findRouteById(routeId));
        trip.setStatus(Trip.TripStatus.IN_PROGRESS);
        trip.setActualDepartureTime(LocalDateTime.now());
        
        return repository.save(trip);
    }

    @Override
    @Transactional
    public Trip endCurrentTrip() {
        log.debug("Ending current trip");
        Long driverId = getCurrentDriverId();
        Trip currentTrip = repository.findCurrentTripByDriver(driverId)
                .orElseThrow(() -> new ValidationException("No active trip found for current driver"));
        
        completeTrip(currentTrip.getId());
        return currentTrip;
    }

    @Override
    public List<Trip> findByStatus(String status) {
        log.debug("Finding trips by status: {}", status);
        validateTripStatus(status);
        return repository.findByStatus(Trip.TripStatus.valueOf(status));
    }

    @Override
    public List<Trip> findByDateRange(LocalDateTime start, LocalDateTime end) {
        log.debug("Finding trips between {} and {}", start, end);
        validateDateRange(start, end);
        return repository.findByDateRange(start, end);
    }

    @Override
    public Trip findCurrentTripByStudentId(Long studentId) {
        log.debug("Finding current trip for student {}", studentId);
        validateStudentExists(studentId);
        return repository.findCurrentTripByStudentId(studentId)
                .orElseThrow(() -> new EntityNotFoundException("No active trip found for student: " + studentId));
    }

    @Override
    public List<Trip> findByStudentId(Long studentId) {
        log.debug("Finding all trips for student {}", studentId);
        validateStudentExists(studentId);
        return repository.findByStudentId(studentId);
    }

    @Override
    public List<Trip> getTripHistory(int page, int size) {
        log.debug("Getting trip history with pagination");
        return repository.findTripHistory(page, size);
    }

    @Override
    public Trip getCurrentTrip() {
        log.debug("Getting current trip");
        Long driverId = getCurrentDriverId();
        return repository.findCurrentTripByDriver(driverId)
                .orElseThrow(() -> new ValidationException("No active trip found for current driver"));
    }

    @Override
    public List<Trip> findBySchoolId(Long schoolId) {
        log.debug("Finding trips for school {}", schoolId);
        validateSchoolExists(schoolId);
        return repository.findBySchoolId(schoolId);
    }

    // Private validation methods
    private void validateDriverExists(Long driverId) {
        if (!driverRepository.existsById(driverId)) {
            throw new EntityNotFoundException("Driver not found with id: " + driverId);
        }
    }

    private void validateVehicleExists(Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new EntityNotFoundException("Vehicle not found with id: " + vehicleId);
        }
    }

    private void validateRouteExists(Long routeId) {
        if (routeId == null) {
            throw new ValidationException("Route ID cannot be null");
        }
    }

    private void validateSchoolExists(Long schoolId) {
        if (schoolId == null) {
            throw new ValidationException("School ID cannot be null");
        }
    }

    private Trip findTripById(Long tripId) {
        return repository.findById(tripId)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found with id: " + tripId));
    }

    private Driver findDriverById(Long driverId) {
        return driverRepository.findById(driverId)
                .map(user -> (Driver) user)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with id: " + driverId));
    }

    private Vehicle findVehicleById(Long vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + vehicleId));
    }

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new ValidationException("Start and end dates cannot be null");
        }
        if (start.isAfter(end)) {
            throw new ValidationException("Start date cannot be after end date");
        }
    }

    private void validateDriverAssignment(Driver driver, Trip trip) {
        if (driver.getStatus() == Driver.DriverStatus.AVAILABLE) {
            throw new ValidationException("Driver is not available for assignment");
        }

        List<Trip> activeTrips = repository.findUpcomingTripsByDriver(driver.getId());
        if (!activeTrips.isEmpty() && !activeTrips.get(0).getId().equals(trip.getId())) {
            throw new ValidationException("Driver has other active trips scheduled");
        }
    }

    private void validateVehicleAssignment(Vehicle vehicle, Trip trip) {
        if (!vehicle.isActive()) {
            throw new ValidationException("Vehicle is not available for assignment");
        }

        // Check if vehicle has any active trips
        List<Trip> activeTrips = repository.findByVehicleIdAndActiveTrue(vehicle.getId());
        if (!activeTrips.isEmpty() && !activeTrips.get(0).getId().equals(trip.getId())) {
            throw new ValidationException("Vehicle has other active trips scheduled");
        }
    }

    private void validateTripStatus(String status) {
        try {
            Trip.TripStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid trip status: " + status);
        }
    }

    private void validateStatusUpdate(Trip trip, Trip.TripStatus newStatus) {
        if (trip.getStatus() == Trip.TripStatus.COMPLETED || trip.getStatus() == Trip.TripStatus.CANCELLED) {
            throw new ValidationException("Cannot update status of completed or cancelled trips");
        }

        // Validate status transition
        switch (newStatus) {
            case IN_PROGRESS:
                if (trip.getStatus() != Trip.TripStatus.SCHEDULED) {
                    throw new ValidationException("Trip must be in SCHEDULED status to start");
                }
                break;
            case COMPLETED:
                if (trip.getStatus() != Trip.TripStatus.IN_PROGRESS) {
                    throw new ValidationException("Trip must be in IN_PROGRESS status to complete");
                }
                break;
            case CANCELLED:
                if (trip.getStatus() == Trip.TripStatus.COMPLETED) {
                    throw new ValidationException("Cannot cancel a completed trip");
                }
                break;
        }
    }

    private void validateScheduleUpdate(Trip trip, LocalDateTime departureTime) {
        if (trip.getStatus() != Trip.TripStatus.SCHEDULED) {
            throw new ValidationException("Can only update schedule for trips in SCHEDULED status");
        }

        if (departureTime == null) {
            throw new ValidationException("Departure time cannot be null");
        }

        LocalDateTime now = LocalDateTime.now();
        long advanceHours = ChronoUnit.HOURS.between(now, departureTime);
        if (advanceHours < MIN_SCHEDULE_ADVANCE_HOURS) {
            throw new ValidationException("Trip must be scheduled at least " + MIN_SCHEDULE_ADVANCE_HOURS + " hours in advance");
        }
        if (advanceHours > MAX_SCHEDULE_ADVANCE_DAYS * 24) {
            throw new ValidationException("Trip cannot be scheduled more than " + MAX_SCHEDULE_ADVANCE_DAYS + " days in advance");
        }
    }

    private void validateTripStart(Trip trip) {
        if (trip.getStatus() != Trip.TripStatus.SCHEDULED) {
            throw new ValidationException("Only scheduled trips can be started");
        }

        if (trip.getDriver() == null) {
            throw new ValidationException("Cannot start trip without assigned driver");
        }

        if (trip.getVehicle() == null) {
            throw new ValidationException("Cannot start trip without assigned vehicle");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime scheduledTime = trip.getScheduledDepartureTime();
        long minutesDifference = Math.abs(ChronoUnit.MINUTES.between(now, scheduledTime));
        
        if (minutesDifference > 30) {
            throw new ValidationException("Trip can only be started within 30 minutes of scheduled departure time");
        }
    }

    private void validateTripCompletion(Trip trip) {
        if (trip.getStatus() != Trip.TripStatus.IN_PROGRESS) {
            throw new ValidationException("Only in-progress trips can be completed");
        }

        if (trip.getActualDepartureTime() == null) {
            throw new ValidationException("Trip must have a departure time recorded");
        }

        LocalDateTime now = LocalDateTime.now();
        long durationMinutes = ChronoUnit.MINUTES.between(trip.getActualDepartureTime(), now);
        if (durationMinutes < MIN_TRIP_DURATION_MINUTES) {
            throw new ValidationException("Trip duration must be at least " + MIN_TRIP_DURATION_MINUTES + " minutes");
        }
    }

    private void validateTripCancellation(Trip trip) {
        if (trip.getStatus() == Trip.TripStatus.COMPLETED) {
            throw new ValidationException("Cannot cancel a completed trip");
        }
        if (trip.getStatus() == Trip.TripStatus.CANCELLED) {
            throw new ValidationException("Trip is already cancelled");
        }
    }

    private void validateCancellationReason(String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new ValidationException("Cancellation reason is required");
        }
        if (reason.length() > 500) {
            throw new ValidationException("Cancellation reason cannot exceed 500 characters");
        }
    }

    private void validateStudentExists(Long studentId) {
        // Implementation of validateStudentExists method
    }

    private Long getCurrentDriverId() {
        // Implementation to get current driver ID from security context
        return null; // TODO: Implement this method
    }

    private Route findRouteById(Long routeId) {
        // Implementation to find route by ID
        return null; // TODO: Implement this method
    }
} 