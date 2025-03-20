package com.example.backend.repository;

import com.example.backend.entities.user.Driver;
import com.example.backend.repository.base.EmailAwareRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends EmailAwareRepository<Driver> {
    
    @Query("""
            SELECT d FROM Driver d 
            WHERE d.status = com.example.backend.entities.user.Driver$DriverStatus.AVAILABLE 
            AND d.active = true
            """)
    List<Driver> findAvailableDrivers();

    Optional<Driver> findByLicenseNumberAndActiveTrue(String licenseNumber);

    @Query("""
            SELECT DISTINCT d FROM Driver d 
            LEFT JOIN FETCH d.vehicle 
            LEFT JOIN FETCH d.trips t 
            WHERE d.id = :driverId 
            AND d.active = true 
            AND (t IS NULL OR t.status IN (com.example.backend.entities.Trip$TripStatus.SCHEDULED, com.example.backend.entities.Trip$TripStatus.IN_PROGRESS))
            ORDER BY t.scheduledDepartureTime ASC
            """)
    Optional<Driver> findByIdWithCurrentTrips(@Param("driverId") Long driverId);

    @Query("""
            SELECT COUNT(t) FROM Driver d 
            JOIN d.trips t 
            WHERE d.id = :driverId 
            AND t.scheduledDepartureTime BETWEEN :start AND :end 
            AND t.status = com.example.backend.entities.Trip$TripStatus.COMPLETED
            """)
    long countCompletedTripsInPeriod(@Param("driverId") Long driverId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
            SELECT d FROM Driver d 
            WHERE d.active = true 
            AND EXISTS (
                SELECT t FROM Trip t 
                WHERE t.driver = d 
                AND t.route.school.id = :schoolId
            )
            """)
    List<Driver> findDriversBySchool(Long schoolId);

    @Query("""
            SELECT d FROM Driver d 
            LEFT JOIN FETCH d.vehicle v 
            WHERE d.active = true 
            AND v.currentLatitude IS NOT NULL 
            AND v.currentLongitude IS NOT NULL
            """)
    List<Driver> findAllActiveWithLocation();

    List<Driver> findBySchoolIdAndActiveTrue(Long schoolId);
    
    boolean existsByLicenseNumber(String licenseNumber);
    
    @Query("SELECT d FROM Driver d " +
           "LEFT JOIN FETCH d.trips " +
           "WHERE d.id = :id AND d.active = true")
    Optional<Driver> findByIdWithTrips(Long id);
    
    @Query("""
            SELECT d FROM Driver d 
            WHERE d.school.id = :schoolId 
            AND d.active = true 
            AND d.status = com.example.backend.entities.user.Driver$DriverStatus.AVAILABLE
            AND NOT EXISTS (
                SELECT t FROM Trip t 
                WHERE t.driver = d 
                AND t.status IN (com.example.backend.entities.Trip$TripStatus.SCHEDULED, com.example.backend.entities.Trip$TripStatus.IN_PROGRESS)
                AND t.scheduledDepartureTime BETWEEN :startTime AND :endTime
            )
            """)
    List<Driver> findAvailableDrivers(
            @Param("schoolId") Long schoolId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
    
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    
    Optional<Driver> findByEmail(String email);
    
    @Query("""
            SELECT d FROM Driver d 
            WHERE d.status = :status 
            AND d.active = true
            """)
    List<Driver> findByStatus(String status);

    @Query("""
            SELECT d FROM Driver d 
            WHERE d.vehicle.id = :vehicleId 
            AND d.active = true
            """)
    List<Driver> findByVehicleId(Long vehicleId);

    @Query("""
            SELECT d FROM Driver d 
            WHERE d.school.id = :schoolId 
            AND d.active = true
            """)
    List<Driver> findBySchoolId(Long schoolId);
} 