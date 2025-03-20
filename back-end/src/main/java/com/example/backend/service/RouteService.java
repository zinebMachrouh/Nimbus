package com.example.backend.service;

import com.example.backend.entities.Route;
import com.example.backend.service.base.BaseService;

import java.util.List;
import java.util.Optional;

public interface RouteService extends BaseService<Route> {
    List<Route> findBySchoolId(Long schoolId);
    List<Route> findByType(Route.RouteType type);
    Optional<Route> findByIdWithStops(Long id);
    List<Route> findBySchoolAndType(Long schoolId, Route.RouteType type);
    void addStop(Long routeId, String stopName, Double latitude, Double longitude, Integer sequence);
    void updateStop(Long routeId, Long stopId, String stopName, Double latitude, Double longitude, Integer sequence);
    void removeStop(Long routeId, Long stopId);
    void reorderStops(Long routeId, List<Long> stopIds);
    void assignToSchool(Long routeId, Long schoolId);
    void removeFromSchool(Long routeId);
    List<Route> findActiveRoutesWithStats(Long schoolId);
    long countActiveStudentsOnRoute(Long routeId);
    long countCompletedTripsOnRoute(Long routeId);
    double calculateRouteDistance(Long routeId);
    int estimateRouteDuration(Long routeId);
} 