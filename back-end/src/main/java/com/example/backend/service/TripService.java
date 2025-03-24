package com.example.backend.service;

import com.example.backend.dto.trip.TripRequest;
import com.example.backend.entities.Trip;
import com.example.backend.service.base.BaseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TripService extends BaseService<Trip> {
    List<Trip> findByDriverId(Long driverId);
    List<Trip> findByVehicleId(Long vehicleId);
    List<Trip> findByRouteId(Long routeId);
    List<Trip> findUpcomingTrips(LocalDateTime start, LocalDateTime end);
    List<Trip> findActiveTrips();
    List<Trip> findUpcomingTripsByDriver(Long driverId);
    long countActiveTripsForSchool(Long schoolId);
    void assignDriver(Long tripId, Long driverId);
    void assignVehicle(Long tripId, Long vehicleId);
    void updateTripStatus(Long tripId, String status);
    void updateTripSchedule(Long tripId, LocalDateTime departureTime, LocalDateTime estimatedArrivalTime);
    List<Trip> findTripsWithStats(Long schoolId, LocalDateTime start, LocalDateTime end);
    void startTrip(Long tripId);
    void completeTrip(Long tripId);
    void cancelTrip(Long tripId, String reason);
    Trip findById(Long id);
    List<Trip> findByStudentId(Long studentId);
    List<Trip> findBySchoolId(Long schoolId);
    List<Trip> findByDateRange(LocalDateTime start, LocalDateTime end);
    List<Trip> findByStatus(String status);
    Trip save(Trip trip);
    void delete(Long id);
    Trip findByIdWithDetails(Long id);
    Trip createAndStartTrip(Long routeId);
    Trip endCurrentTrip();
    Trip getCurrentTrip();
    List<Trip> getTripHistory(int page, int size);
    Trip findCurrentTripByStudentId(Long studentId);
    List<Trip> findTripsByStudentId(Long studentId, int page, int size);
    Trip create(@Valid TripRequest tripRequest);
    Trip assignStudents(Long tripId, List<Long> studentIds);
} 