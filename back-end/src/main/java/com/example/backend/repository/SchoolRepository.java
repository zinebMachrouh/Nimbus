package com.example.backend.repository;

import com.example.backend.entities.School;
import com.example.backend.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends BaseRepository<School> {
    List<School> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    
    @Query("SELECT s FROM School s WHERE " +
           "s.active = true AND " +
           "ST_Distance_Sphere(point(s.longitude, s.latitude), point(:longitude, :latitude)) <= :radiusInMeters")
    List<School> findNearbySchools(Double latitude, Double longitude, Double radiusInMeters);
    
    @Query("SELECT COUNT(s) FROM School s WHERE s.active = true")
    long countActiveSchools();
    
    @Query("SELECT s FROM School s LEFT JOIN FETCH s.students WHERE s.id = :id AND s.active = true")
    School findByIdWithStudents(Long id);

    @Query("SELECT s FROM School s WHERE s.active = true ORDER BY s.createdAt DESC, s.id DESC LIMIT 1")
    Optional<School> findFirstByOrderByCreatedAtDesc();
} 