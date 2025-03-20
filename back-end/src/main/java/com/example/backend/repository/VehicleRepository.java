package com.example.backend.repository;

import com.example.backend.entities.Vehicle;
import com.example.backend.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends BaseRepository<Vehicle> {
    Optional<Vehicle> findByLicensePlateAndActiveTrue(String licensePlate);
    
    @Query("SELECT v FROM Vehicle v WHERE v.active = true AND v.status = com.example.backend.entities.Vehicle$VehicleStatus.AVAILABLE")
    List<Vehicle> findAvailableAndActiveVehicles();
    
    @Query("SELECT v FROM Vehicle v " +
           "LEFT JOIN FETCH v.driver " +
           "WHERE v.id = :id AND v.active = true")
    Optional<Vehicle> findByIdWithDriver(Long id);
    
    @Query("SELECT v FROM Vehicle v " +
           "WHERE v.active = true " +
           "AND v.currentLatitude IS NOT NULL " +
           "AND v.currentLongitude IS NOT NULL")
    List<Vehicle> findAllActiveWithLocation();
    
    @Query("SELECT v FROM Vehicle v WHERE " +
           "v.active = true AND " +
           "ST_Distance_Sphere(point(v.currentLongitude, v.currentLatitude), point(:longitude, :latitude)) <= :radiusInMeters")
    List<Vehicle> findVehiclesNearLocation(Double latitude, Double longitude, Double radiusInMeters);
    
    @Query("SELECT COUNT(v) FROM Vehicle v " +
           "WHERE v.active = true " +
           "AND EXISTS (SELECT t FROM Trip t WHERE t.vehicle = v AND t.status = com.example.backend.entities.Trip$TripStatus.IN_PROGRESS)")
    long countActiveVehiclesInTrip();
    
    @Query("SELECT v FROM Vehicle v " +
           "LEFT JOIN FETCH v.trips t " +
           "WHERE v.id = :id " +
           "AND v.active = true " +
           "AND t.status = com.example.backend.entities.Trip$TripStatus.IN_PROGRESS")
    Optional<Vehicle> findByIdWithCurrentTrip(Long id);

    @Query("""
            SELECT v FROM Vehicle v 
            WHERE v.active = true 
            AND v.status = com.example.backend.entities.Vehicle$VehicleStatus.AVAILABLE
            """)
    List<Vehicle> findAvailableVehicles();

    @Query("""
            SELECT v FROM Vehicle v 
            WHERE v.active = true 
            AND EXISTS (
                SELECT t FROM Trip t 
                WHERE t.vehicle = v 
                AND t.route.school.id = :schoolId
            )
            """)
    List<Vehicle> findVehiclesBySchool(Long schoolId);

    @Query("""
            SELECT v FROM Vehicle v 
            WHERE v.active = true 
            AND v.currentLatitude IS NOT NULL 
            AND v.currentLongitude IS NOT NULL 
            AND ST_Distance_Sphere(
                point(v.currentLongitude, v.currentLatitude),
                point(:longitude, :latitude)
            ) <= :radiusInMeters
            """)
    List<Vehicle> findNearbyVehicles(Double latitude, Double longitude, Double radiusInMeters);

    @Query("""
            SELECT v FROM Vehicle v 
            WHERE v.active = true 
            AND EXISTS (
                SELECT t FROM Trip t 
                WHERE t.vehicle = v 
                AND t.status = com.example.backend.entities.Trip$TripStatus.IN_PROGRESS
            )
            """)
    List<Vehicle> findActivelyOperatingVehicles();

    @Query("""
            SELECT COUNT(t) FROM Vehicle v 
            JOIN Trip t ON t.vehicle = v 
            WHERE v.id = :vehicleId 
            AND t.status = com.example.backend.entities.Trip$TripStatus.COMPLETED
            """)
    long countCompletedTrips(Long vehicleId);
} 