package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.school.SchoolRequest;
import com.example.backend.entities.School;
import com.example.backend.service.SchoolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
@Tag(name = "Schools", description = "School management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class SchoolController {
    private final SchoolService schoolService;

    @Operation(summary = "Get all schools")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<School>>> getAllSchools() {
        return ResponseEntity.ok(ApiResponse.success(schoolService.findAll()));
    }

    @Operation(summary = "Get school by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<School>> getSchoolById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(schoolService.findById(id)));
    }

    @Operation(summary = "Create a new school")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<School>> createSchool(@Valid @RequestBody SchoolRequest schoolRequest) {
        return ResponseEntity.ok(ApiResponse.success(schoolService.createSchool(schoolRequest)));
    }

    @Operation(summary = "Update a school")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<School>> updateSchool(
            @PathVariable Long id,
            @Valid @RequestBody SchoolRequest schoolRequest) {
        return ResponseEntity.ok(ApiResponse.success(schoolService.updateSchool(id, schoolRequest)));
    }

    @Operation(summary = "Delete a school")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSchool(@PathVariable Long id) {
        schoolService.softDeleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find nearby schools")
    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<School>>> findNearbySchools(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Double radiusInMeters) {
        return ResponseEntity.ok(ApiResponse.success(
                schoolService.findNearbySchools(latitude, longitude, radiusInMeters)));
    }

    @Operation(summary = "Get school statistics")
    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSchoolStatistics(@PathVariable Long id) {
        School school = schoolService.findById(id);
        Map<String, Object> stats = new HashMap<>();
        stats.put("activeStudents", schoolService.countActiveStudents(id));
        stats.put("activeRoutes", schoolService.countActiveRoutes(id));
        stats.put("activeDrivers", schoolService.countActiveDrivers(id));
        stats.put("activeVehicles", schoolService.countActiveVehicles(id));
        stats.put("school", school);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @Operation(summary = "Find schools by name containing")
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<School>>> findSchoolsByNameContaining(
            @RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(schoolService.findByNameContaining(name)));
    }

    @Operation(summary = "Get school with students")
    @GetMapping("/{id}/with-students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<School>> getSchoolWithStudents(@PathVariable Long id) {
        Optional<School> school = schoolService.findByIdWithStudents(id);
        return school.map(s -> ResponseEntity.ok(ApiResponse.success(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Add student to school")
    @PostMapping("/{schoolId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> addStudent(
            @PathVariable Long schoolId,
            @PathVariable Long studentId) {
        schoolService.addStudent(schoolId, studentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Remove student from school")
    @DeleteMapping("/{schoolId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeStudent(
            @PathVariable Long schoolId,
            @PathVariable Long studentId) {
        schoolService.removeStudent(schoolId, studentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Add route to school")
    @PostMapping("/{schoolId}/routes/{routeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> addRoute(
            @PathVariable Long schoolId,
            @PathVariable Long routeId) {
        schoolService.addRoute(schoolId, routeId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Remove route from school")
    @DeleteMapping("/{schoolId}/routes/{routeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeRoute(
            @PathVariable Long schoolId,
            @PathVariable Long routeId) {
        schoolService.removeRoute(schoolId, routeId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Get schools with statistics")
    @GetMapping("/with-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<School>>> getSchoolsWithStats() {
        return ResponseEntity.ok(ApiResponse.success(schoolService.findSchoolsWithStats()));
    }

    @Operation(summary = "Count active schools")
    @GetMapping("/count/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> countActiveSchools() {
        return ResponseEntity.ok(ApiResponse.success(schoolService.countActiveSchools()));
    }
} 