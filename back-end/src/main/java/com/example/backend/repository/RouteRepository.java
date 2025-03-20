package com.example.backend.repository;

import com.example.backend.entities.Route;
import com.example.backend.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findBySchoolIdAndActiveTrue(Long schoolId);
    List<Route> findByTypeAndActiveTrue(Route.RouteType type);
    
    @Query("SELECT r FROM Route r " +
           "LEFT JOIN FETCH r.stops " +
           "WHERE r.id = :id AND r.active = true")
    Optional<Route> findByIdWithStops(Long id);
    
    @Query("SELECT r FROM Route r " +
           "LEFT JOIN FETCH r.stops " +
           "WHERE r.school.id = :schoolId " +
           "AND r.type = :type " +
           "AND r.active = true")
    List<Route> findBySchoolAndType(Long schoolId, Route.RouteType type);
    
    @Query("SELECT COUNT(r) FROM Route r WHERE r.school.id = :schoolId AND r.active = true")
    long countActiveRoutesBySchool(@Param("schoolId") Long schoolId);
    
    @Query("""
            SELECT DISTINCT r FROM Route r 
            JOIN r.stops s 
            WHERE r.active = true 
            AND ST_Distance_Sphere(
                point(s.longitude, s.latitude), 
                point(:longitude, :latitude)
            ) <= :radiusInMeters
            """)
    List<Route> findRoutesNearLocation(Double latitude, Double longitude, Double radiusInMeters);

    @Query("SELECT COUNT(s) FROM Student s " +
           "WHERE s.school.id IN (SELECT r.school.id FROM Route r WHERE r.id = :routeId) " +
           "AND s.active = true")
    long countActiveStudentsOnRoute(@Param("routeId") Long routeId);

    @Query("SELECT COUNT(t) FROM Trip t " +
           "WHERE t.route.id = :routeId " +
           "AND t.status = com.example.backend.entities.Trip$TripStatus.COMPLETED")
    long countCompletedTripsOnRoute(@Param("routeId") Long routeId);

    @Query("SELECT COUNT(r) FROM Route r WHERE r.active = true")
    long countActiveRoutes();

    List<Route> findAllByActiveTrue();

    long countByStatus(String status);
    List<Route> findByStatus(String status);

    // Get all routes for now, we'll filter active ones in the service
    List<Route> findAll();
} 