package com.example.backend.service;

import com.example.backend.dto.school.SchoolRequest;
import com.example.backend.entities.School;
import com.example.backend.service.base.BaseService;

import java.util.List;
import java.util.Optional;

public interface SchoolService extends BaseService<School> {
    School createSchool(SchoolRequest school);
    School updateSchool(Long id, SchoolRequest school);
    List<School> findByNameContaining(String name);
    List<School> findNearbySchools(Double latitude, Double longitude, Double radiusInMeters);
    long countActiveSchools();
    Optional<School> findByIdWithStudents(Long id);
    void addStudent(Long schoolId, Long studentId);
    void removeStudent(Long schoolId, Long studentId);
    void addRoute(Long schoolId, Long routeId);
    void removeRoute(Long schoolId, Long routeId);
    List<School> findSchoolsWithStats();
    long countActiveStudents(Long schoolId);
    long countActiveRoutes(Long schoolId);
    long countActiveDrivers(Long schoolId);
    long countActiveVehicles(Long schoolId);
} 