package com.example.backend.repository;

import com.example.backend.entities.Trip;
import com.example.backend.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends BaseRepository<Trip> {
    List<Trip> findByDriverIdAndActiveTrue(Long driverId);
    List<Trip> findByVehicleIdAndActiveTrue(Long vehicleId);
    List<Trip> findByRouteIdAndActiveTrue(Long routeId);
    
    @Query("SELECT t FROM Trip t " +
           "WHERE t.active = true " +
           "AND t.status = com.example.backend.entities.Trip$TripStatus.SCHEDULED " +
           "AND t.scheduledDepartureTime BETWEEN :start AND :end")
    List<Trip> findUpcomingTrips(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT t FROM Trip t " +
           "WHERE t.active = true " +
           "AND t.status = com.example.backend.entities.Trip$TripStatus.IN_PROGRESS")
    List<Trip> findActiveTrips();
    
    @Query("""
            SELECT t FROM Trip t 
            LEFT JOIN FETCH t.driver 
            LEFT JOIN FETCH t.vehicle 
            LEFT JOIN FETCH t.route 
            WHERE t.id = :id
            """)
    Optional<Trip> findByIdWithDetails(Long id);
    
    @Query("SELECT t FROM Trip t " +
           "WHERE t.driver.id = :driverId " +
           "AND t.active = true " +
           "AND t.status IN (com.example.backend.entities.Trip$TripStatus.SCHEDULED, " +
           "com.example.backend.entities.Trip$TripStatus.IN_PROGRESS) " +
           "ORDER BY t.scheduledDepartureTime ASC")
    List<Trip> findUpcomingTripsByDriver(Long driverId);
    
    @Query("SELECT COUNT(t) FROM Trip t " +
           "WHERE t.route.school.id = :schoolId " +
           "AND t.active = true " +
           "AND t.status IN (com.example.backend.entities.Trip$TripStatus.SCHEDULED, " +
           "com.example.backend.entities.Trip$TripStatus.IN_PROGRESS)")
    long countActiveTripsForSchool(Long schoolId);

    @Query("""
            SELECT t FROM Trip t 
            WHERE t.driver.id = :driverId 
            AND t.status = com.example.backend.entities.Trip$TripStatus.IN_PROGRESS
            """)
    Optional<Trip> findCurrentTripByDriver(Long driverId);

    @Query("""
            SELECT t FROM Trip t 
            WHERE t.status = :status 
            AND t.active = true
            """)
    List<Trip> findByStatus(Trip.TripStatus status);

    @Query("""
            SELECT t FROM Trip t 
            WHERE t.scheduledDepartureTime BETWEEN :start AND :end 
            AND t.active = true
            """)
    List<Trip> findByDateRange(LocalDateTime start, LocalDateTime end);

    @Query("""
            SELECT t FROM Trip t 
            JOIN t.attendances a 
            JOIN a.student s 
            WHERE s.id = :studentId 
            AND t.status = com.example.backend.entities.Trip$TripStatus.IN_PROGRESS
            """)
    Optional<Trip> findCurrentTripByStudentId(Long studentId);

    @Query("""
            SELECT t FROM Trip t 
            JOIN t.attendances a 
            JOIN a.student s 
            WHERE s.id = :studentId 
            AND t.active = true
            """)
    List<Trip> findByStudentId(Long studentId);

    @Query("""
            SELECT t FROM Trip t 
            WHERE t.active = true 
            ORDER BY t.scheduledDepartureTime DESC
            """)
    List<Trip> findTripHistory(int page, int size);

    @Query("""
            SELECT t FROM Trip t 
            WHERE t.route.school.id = :schoolId 
            AND t.active = true
            """)
    List<Trip> findBySchoolId(Long schoolId);

    @Query("""
            SELECT t FROM Trip t 
            JOIN t.attendances a 
            JOIN a.student s 
            WHERE s.id = :studentId 
            AND t.active = true
            ORDER BY t.scheduledDepartureTime DESC
            """)
    List<Trip> findTripsByStudentId(Long studentId, int page, int size);
} 