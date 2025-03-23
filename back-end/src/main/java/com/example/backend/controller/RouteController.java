package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.route.RouteRequest;
import com.example.backend.dto.route.StopRequest;
import com.example.backend.entities.Route;
import com.example.backend.entities.School;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.service.RouteService;
import com.example.backend.service.SchoolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
@Tag(name = "Routes", description = "Route management endpoints")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
public class RouteController {
    private final RouteService routeService;
    private final SchoolService schoolService;

    @Operation(summary = "Get all routes")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Route>>> getAllRoutes() {
        return ResponseEntity.ok(ApiResponse.success(routeService.findAll()));
    }

    @Operation(summary = "Get route by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Route>> getRouteById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(routeService.findById(id)));
    }

    @Operation(summary = "Create a new route")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Route>> createRoute(@Valid @RequestBody RouteRequest routeRequest) {
        // Enhanced validation for schoolId
        if (routeRequest.getSchoolId() == null || routeRequest.getSchoolId() <= 0) {
            log.error("Invalid schoolId provided: {}", routeRequest.getSchoolId());
            throw new IllegalArgumentException("A valid school ID is required to create a route");
        }
        
        // Validate that stops are provided for route creation
        if (routeRequest.getStops() == null || routeRequest.getStops().isEmpty()) {
            log.error("No stops provided for route creation");
            throw new IllegalArgumentException("At least one stop is required to create a route");
        }
        
        try {
            log.info("Creating route for school ID: {}", routeRequest.getSchoolId());
            
            // Find school first to validate it exists
            School school = schoolService.findById(routeRequest.getSchoolId());
            
            if (school == null) {
                log.error("School not found with ID: {}", routeRequest.getSchoolId());
                throw new EntityNotFoundException("School not found with ID: " + routeRequest.getSchoolId());
            }
            
            log.info("Found school: {}", school.getName());
            
            Route route = new Route();
            route.setName(routeRequest.getName());
            route.setDescription(routeRequest.getDescription());
            route.setType(routeRequest.getType());
            route.setActive(true);
            
            // Set school directly before saving
            route.setSchool(school);
            
            // Save the route with school already set
            log.info("Saving route with school: {}", school.getId());
            Route savedRoute = routeService.save(route);
            log.info("Route saved with ID: {}", savedRoute.getId());
            
            // Add stops if provided
            if (routeRequest.getStops() != null && !routeRequest.getStops().isEmpty()) {
                log.info("Adding {} stops to route", routeRequest.getStops().size());
                for (int i = 0; i < routeRequest.getStops().size(); i++) {
                    RouteRequest.RouteStopRequest stopRequest = routeRequest.getStops().get(i);
                    routeService.addStop(
                        savedRoute.getId(),
                        stopRequest.getName(),
                        stopRequest.getAddress(),
                        stopRequest.getLatitude(),
                        stopRequest.getLongitude(),
                        i + 1, // Sequence number starting from 1
                        stopRequest.getEstimatedMinutesFromStart()
                    );
                }
                log.info("All stops added successfully");
            }
            
            // Reload the route with all relationships
            savedRoute = routeService.findById(savedRoute.getId());
            
            return ResponseEntity.ok(ApiResponse.success(savedRoute));
        } catch (Exception e) {
            log.error("Error creating route: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Operation(summary = "Update a route")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Route>> updateRoute(
            @PathVariable Long id, 
            @Valid @RequestBody RouteRequest routeRequest) {
        try {
            log.info("Updating route with ID {}: {}", id, routeRequest.getName());
            
            // Get the existing route
            Route route = routeService.findById(id);
            
            // Update basic properties
            route.setName(routeRequest.getName());
            route.setDescription(routeRequest.getDescription());
            route.setType(routeRequest.getType());
            
            // Handle school assignment if needed
            if (routeRequest.getSchoolId() != null) {
                School school = schoolService.findById(routeRequest.getSchoolId());
                route.setSchool(school);
                log.info("Assigned route to school: {}", school.getName());
            }
            
            // Save the updated route
            Route savedRoute = routeService.save(route);
            log.info("Route updated successfully");
            
            // Return the updated route
            return ResponseEntity.ok(ApiResponse.success(savedRoute));
        } catch (Exception e) {
            log.error("Error updating route {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Operation(summary = "Delete a route")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        routeService.softDeleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find routes by school ID")
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Route>>> findBySchoolId(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(routeService.findBySchoolId(schoolId)));
    }

    @Operation(summary = "Find routes by type")
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Route>>> findByType(@PathVariable Route.RouteType type) {
        return ResponseEntity.ok(ApiResponse.success(routeService.findByType(type)));
    }

    @Operation(summary = "Get route with stops")
    @GetMapping("/{id}/with-stops")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'PARENT')")
    public ResponseEntity<ApiResponse<Route>> findByIdWithStops(@PathVariable Long id) {
        Optional<Route> route = routeService.findByIdWithStops(id);
        return route.map(r -> ResponseEntity.ok(ApiResponse.success(r)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Find routes by school and type")
    @GetMapping("/school/{schoolId}/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Route>>> findBySchoolAndType(
            @PathVariable Long schoolId,
            @PathVariable Route.RouteType type) {
        return ResponseEntity.ok(ApiResponse.success(routeService.findBySchoolAndType(schoolId, type)));
    }

    @Operation(summary = "Add stop to route")
    @PostMapping("/{routeId}/stops")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> addStop(
            @PathVariable Long routeId,
            @Valid @RequestBody StopRequest stopRequest) {
        log.info("Adding stop to route {}: {}", routeId, stopRequest.getName());
        routeService.addStop(
                routeId,
                stopRequest.getName(),
                stopRequest.getAddress(),
                stopRequest.getLatitude(),
                stopRequest.getLongitude(),
                stopRequest.getSequence(),
                stopRequest.getEstimatedMinutesFromStart()
        );
        log.info("Stop added successfully");
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Update stop")
    @PutMapping("/{routeId}/stops/{stopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStop(
            @PathVariable Long routeId,
            @PathVariable Long stopId,
            @Valid @RequestBody StopRequest stopRequest) {
        routeService.updateStop(
                routeId,
                stopId,
                stopRequest.getName(),
                stopRequest.getLatitude(),
                stopRequest.getLongitude(),
                stopRequest.getSequence()
        );
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Remove stop from route")
    @DeleteMapping("/{routeId}/stops/{stopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeStop(
            @PathVariable Long routeId,
            @PathVariable Long stopId) {
        routeService.removeStop(routeId, stopId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Reorder stops")
    @PutMapping("/{routeId}/stops/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> reorderStops(
            @PathVariable Long routeId,
            @RequestBody List<Long> stopIds) {
        routeService.reorderStops(routeId, stopIds);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Assign route to school")
    @PutMapping("/{routeId}/assign-school/{schoolId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignToSchool(
            @PathVariable Long routeId,
            @PathVariable Long schoolId) {
        routeService.assignToSchool(routeId, schoolId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Remove route from school")
    @PutMapping("/{routeId}/remove-school")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeFromSchool(@PathVariable Long routeId) {
        routeService.removeFromSchool(routeId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find active routes with stats")
    @GetMapping("/school/{schoolId}/with-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Route>>> findActiveRoutesWithStats(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(routeService.findActiveRoutesWithStats(schoolId)));
    }

    @Operation(summary = "Get route statistics")
    @GetMapping("/{routeId}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRouteStatistics(@PathVariable Long routeId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("activeStudents", routeService.countActiveStudentsOnRoute(routeId));
        stats.put("completedTrips", routeService.countCompletedTripsOnRoute(routeId));
        stats.put("distance", routeService.calculateRouteDistance(routeId));
        stats.put("estimatedDuration", routeService.estimateRouteDuration(routeId));
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @Operation(summary = "Count active students on route")
    @GetMapping("/{routeId}/students/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Long>> countActiveStudentsOnRoute(@PathVariable Long routeId) {
        return ResponseEntity.ok(ApiResponse.success(routeService.countActiveStudentsOnRoute(routeId)));
    }

    @Operation(summary = "Count completed trips on route")
    @GetMapping("/{routeId}/trips/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Long>> countCompletedTripsOnRoute(@PathVariable Long routeId) {
        return ResponseEntity.ok(ApiResponse.success(routeService.countCompletedTripsOnRoute(routeId)));
    }

    @Operation(summary = "Calculate route distance")
    @GetMapping("/{routeId}/distance")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Double>> calculateRouteDistance(@PathVariable Long routeId) {
        return ResponseEntity.ok(ApiResponse.success(routeService.calculateRouteDistance(routeId)));
    }

    @Operation(summary = "Estimate route duration")
    @GetMapping("/{routeId}/duration")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Integer>> estimateRouteDuration(@PathVariable Long routeId) {
        return ResponseEntity.ok(ApiResponse.success(routeService.estimateRouteDuration(routeId)));
    }

    @Operation(summary = "Create a new route with school")
    @PostMapping("/school/{schoolId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Route>> createRouteWithSchool(
            @PathVariable Long schoolId,
            @Valid @RequestBody RouteRequest routeRequest) {
        
        // Enhanced validation for schoolId
        if (schoolId == null || schoolId <= 0) {
            log.error("Invalid schoolId provided in path: {}", schoolId);
            throw new IllegalArgumentException("A valid school ID is required");
        }
        
        // Validate that stops are provided for route creation
        if (routeRequest.getStops() == null || routeRequest.getStops().isEmpty()) {
            log.error("No stops provided for route creation");
            throw new IllegalArgumentException("At least one stop is required to create a route");
        }
        
        try {
            log.info("Creating route for school ID (from path): {}", schoolId);
            
            // If routeRequest also has schoolId, log it but prefer the path parameter
            if (routeRequest.getSchoolId() != null && !routeRequest.getSchoolId().equals(schoolId)) {
                log.warn("School ID in request body ({}) differs from path parameter ({}). Using path parameter.",
                        routeRequest.getSchoolId(), schoolId);
            }
            
            // Always use the path parameter schoolId
            routeRequest.setSchoolId(schoolId);
            
            // Find school and validate it exists
            School school = schoolService.findById(schoolId);
            
            if (school == null) {
                log.error("School not found with ID: {}", schoolId);
                throw new EntityNotFoundException("School not found with ID: " + schoolId);
            }
            
            log.info("Found school: {}", school.getName());
            
            // Create route with all fields
            Route route = new Route();
            route.setName(routeRequest.getName());
            route.setDescription(routeRequest.getDescription());
            route.setType(routeRequest.getType());
            route.setActive(true);
            
            // Set school directly
            route.setSchool(school);
            
            // Save with school already set
            log.info("Saving route with school: {}", school.getId());
            Route savedRoute = routeService.save(route);
            log.info("Route saved with ID: {}", savedRoute.getId());
            
            // Add stops if provided
            if (routeRequest.getStops() != null && !routeRequest.getStops().isEmpty()) {
                log.info("Adding {} stops to route", routeRequest.getStops().size());
                for (int i = 0; i < routeRequest.getStops().size(); i++) {
                    RouteRequest.RouteStopRequest stopRequest = routeRequest.getStops().get(i);
                    routeService.addStop(
                        savedRoute.getId(),
                        stopRequest.getName(),
                        stopRequest.getAddress(),
                        stopRequest.getLatitude(),
                        stopRequest.getLongitude(),
                        i + 1, // Sequence number starting from 1
                        stopRequest.getEstimatedMinutesFromStart()
                    );
                }
                log.info("All stops added successfully");
            }
            
            // Reload the route with all relationships
            savedRoute = routeService.findById(savedRoute.getId());
            
            return ResponseEntity.ok(ApiResponse.success(savedRoute));
        } catch (Exception e) {
            log.error("Error creating route with school: {}", e.getMessage(), e);
            throw e;
        }
    }
} 