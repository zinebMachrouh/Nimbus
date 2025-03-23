package com.example.backend.service.impl;

import com.example.backend.entities.Route;
import com.example.backend.entities.School;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.service.RouteService;
import com.example.backend.service.base.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RouteServiceImpl implements RouteService {
    
    private final RouteRepository routeRepository;
    private final SchoolRepository schoolRepository;
    
    // Constants for business rules
    private static final int MINIMUM_STOPS = 2;
    private static final int MAXIMUM_STOPS = 20;
    private static final double MAXIMUM_STOP_DISTANCE_KM = 2.0;
    private static final int BASE_TIME_PER_STOP = 2; // minutes
    private static final double AVERAGE_SPEED = 40.0; // km/h

    @Autowired
    public RouteServiceImpl(RouteRepository routeRepository,
                          SchoolRepository schoolRepository) {
        this.routeRepository = routeRepository;
        this.schoolRepository = schoolRepository;
    }

    // BaseService methods
    @Override
    public List<Route> findAll() {
        return routeRepository.findAll();
    }

    @Override
    public Route findById(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Route not found with id: " + id));
    }

    @Override
    public Route save(Route route) {
        return routeRepository.save(route);
    }

    @Override
    public List<Route> saveAll(List<Route> routes) {
        return routeRepository.saveAll(routes);
    }

    @Override
    public void delete(Long id) {
        routeRepository.deleteById(id);
    }

    @Override
    public void deleteById(Long id) {
        routeRepository.deleteById(id);
    }

    @Override
    public Optional<Route> findByIdAndActiveTrue(Long id) {
        return routeRepository.findById(id).filter(Route::isActive);
    }

    @Override
    public void softDeleteById(Long id) {
        Route route = findRouteById(id);
        route.setActive(false);
        routeRepository.save(route);
    }

    @Override
    public Page<Route> findAll(Pageable pageable) {
        return routeRepository.findAll(pageable);
    }

    @Override
    public boolean existsById(Long id) {
        return routeRepository.existsById(id);
    }

    @Override
    public long count() {
        return routeRepository.count();
    }

    @Override
    public List<Route> findAllActive() {
        return routeRepository.findAllByActiveTrue();
    }

    @Override
    public Route createDriver(Route route) {
        // This method is not applicable for routes
        throw new UnsupportedOperationException("createDriver is not supported for routes");
    }

    @Override
    public void updateDriverProfile(Long id, Route route) {
        // This method is not applicable for routes
        throw new UnsupportedOperationException("updateDriverProfile is not supported for routes");
    }

    // RouteService specific methods
    @Override
    public List<Route> findBySchoolId(Long schoolId) {
        validateSchoolExists(schoolId);
        return routeRepository.findBySchoolIdAndActiveTrue(schoolId);
    }

    @Override
    public List<Route> findByType(Route.RouteType type) {
        if (type == null) {
            throw new ValidationException("Route type cannot be null");
        }
        return routeRepository.findByTypeAndActiveTrue(type);
    }

    @Override
    public Optional<Route> findByIdWithStops(Long id) {
        return routeRepository.findByIdWithStops(id);
    }

    @Override
    public List<Route> findBySchoolAndType(Long schoolId, Route.RouteType type) {
        return routeRepository.findBySchoolAndType(schoolId, type);
    }

    @Override
    @Transactional
    public void addStop(Long routeId, String stopName, Double latitude, Double longitude, Integer sequence) {
        // Call the new extended method with default values for address and estimatedMinutesFromStart
        addStop(routeId, stopName, stopName, latitude, longitude, sequence, null);
    }

    @Override
    @Transactional
    public void addStop(Long routeId, String stopName, String address, Double latitude, Double longitude, 
                        Integer sequence, Integer estimatedMinutesFromStart) {
        Route route = findRouteById(routeId);
        
        if (!StringUtils.hasText(stopName)) {
            throw new ValidationException("Stop name cannot be empty");
        }
        
        if (latitude == null || longitude == null) {
            throw new ValidationException("Stop coordinates cannot be null");
        }
        
        if (sequence == null || sequence < 1 || sequence > route.getStops().size() + 1) {
            throw new ValidationException("Invalid stop sequence");
        }
        
        Route.RouteStop stop = new Route.RouteStop();
        stop.setName(stopName);
        
        // Set address - if not provided, use the stop name as fallback
        stop.setAddress(StringUtils.hasText(address) ? address : stopName);
        
        stop.setLatitude(latitude);
        stop.setLongitude(longitude);
        
        // If estimatedMinutesFromStart is provided, use it; otherwise, calculate it
        if (estimatedMinutesFromStart != null) {
            stop.setEstimatedMinutesFromStart(estimatedMinutesFromStart);
        } else {
            stop.setEstimatedMinutesFromStart(calculateEstimatedMinutes(route.getStops(), sequence - 1));
        }
        
        route.getStops().add(sequence - 1, stop);
        
        // If we've used a custom estimatedMinutesFromStart, don't recalculate everything
        if (estimatedMinutesFromStart == null) {
            updateEstimatedTimes(route.getStops());
        }
        
        routeRepository.save(route);
    }

    @Override
    @Transactional
    public void updateStop(Long routeId, Long stopId, String stopName, Double latitude, Double longitude, Integer sequence) {
        Route route = findRouteById(routeId);
        
        if (!StringUtils.hasText(stopName)) {
            throw new ValidationException("Stop name cannot be empty");
        }
        
        if (latitude == null || longitude == null) {
            throw new ValidationException("Stop coordinates cannot be null");
        }
        
        if (sequence == null || sequence < 1 || sequence > route.getStops().size()) {
            throw new ValidationException("Invalid stop sequence");
        }
        
        Route.RouteStop stop = route.getStops().get(stopId.intValue());
        stop.setName(stopName);
        stop.setLatitude(latitude);
        stop.setLongitude(longitude);
        
        route.getStops().remove(stopId.intValue());
        route.getStops().add(sequence - 1, stop);
        updateEstimatedTimes(route.getStops());
        routeRepository.save(route);
    }

    @Override
    @Transactional
    public void removeStop(Long routeId, Long stopId) {
        Route route = findRouteById(routeId);
        
        if (route.getStops().size() <= MINIMUM_STOPS) {
            throw new ValidationException("Cannot remove stop. Route must have at least " + MINIMUM_STOPS + " stops.");
        }
        
        route.getStops().remove(stopId.intValue());
        updateEstimatedTimes(route.getStops());
        routeRepository.save(route);
    }

    @Override
    @Transactional
    public void reorderStops(Long routeId, List<Long> stopIds) {
        Route route = findRouteById(routeId);
        
        if (stopIds.size() != route.getStops().size()) {
            throw new ValidationException("Invalid number of stops in reorder list");
        }
        
        List<Route.RouteStop> reorderedStops = new ArrayList<>();
        for (Long stopId : stopIds) {
            reorderedStops.add(route.getStops().get(stopId.intValue()));
        }
        
        route.setStops(reorderedStops);
        updateEstimatedTimes(route.getStops());
        routeRepository.save(route);
    }

    @Override
    @Transactional
    public void assignToSchool(Long routeId, Long schoolId) {
        Route route = findRouteById(routeId);
        School school = findSchoolById(schoolId);
        
        route.setSchool(school);
        routeRepository.save(route);
    }

    @Override
    @Transactional
    public void removeFromSchool(Long routeId) {
        Route route = findRouteById(routeId);
        route.setSchool(null);
        routeRepository.save(route);
    }

    @Override
    public List<Route> findActiveRoutesWithStats(Long schoolId) {
        List<Route> routes = routeRepository.findBySchoolIdAndActiveTrue(schoolId);
        routes.forEach(route -> {
            route.setActiveStudentsCount(countActiveStudentsOnRoute(route.getId()));
            route.setCompletedTripsCount(countCompletedTripsOnRoute(route.getId()));
            route.setTotalDistance(calculateRouteDistance(route.getId()));
            route.setEstimatedDuration(estimateRouteDuration(route.getId()));
        });
        return routes;
    }

    @Override
    public long countActiveStudentsOnRoute(Long routeId) {
        return routeRepository.countActiveStudentsOnRoute(routeId);
    }

    @Override
    public long countCompletedTripsOnRoute(Long routeId) {
        return routeRepository.countCompletedTripsOnRoute(routeId);
    }

    @Override
    public double calculateRouteDistance(Long routeId) {
        Route route = findRouteById(routeId);
        if (route.getStops().size() < 2) {
            return 0.0;
        }
        
        double totalDistance = 0.0;
        for (int i = 0; i < route.getStops().size() - 1; i++) {
            Route.RouteStop current = route.getStops().get(i);
            Route.RouteStop next = route.getStops().get(i + 1);
            totalDistance += calculateDistance(current, next);
        }
        return totalDistance;
    }

    @Override
    public int estimateRouteDuration(Long routeId) {
        Route route = findRouteById(routeId);
        if (route.getStops().isEmpty()) {
            return 0;
        }
        
        // Calculate total distance
        double totalDistance = calculateRouteDistance(routeId);
        
        // Calculate driving time (in minutes)
        int drivingTime = (int) ((totalDistance / AVERAGE_SPEED) * 60);
        
        // Calculate total time including stops
        return drivingTime + (route.getStops().size() * BASE_TIME_PER_STOP);
    }

    private void validateSchoolExists(Long schoolId) {
        if (!schoolRepository.existsById(schoolId)) {
            throw new EntityNotFoundException("School not found with id: " + schoolId);
        }
    }

    private Route findRouteById(Long routeId) {
        return routeRepository.findById(routeId)
                .orElseThrow(() -> new EntityNotFoundException("Route not found with id: " + routeId));
    }

    private School findSchoolById(Long schoolId) {
        return schoolRepository.findById(schoolId)
                .orElseThrow(() -> new EntityNotFoundException("School not found with id: " + schoolId));
    }

    private void updateEstimatedTimes(List<Route.RouteStop> stops) {
        for (int i = 0; i < stops.size(); i++) {
            stops.get(i).setEstimatedMinutesFromStart(calculateEstimatedMinutes(stops, i));
        }
    }

    private int calculateEstimatedMinutes(List<Route.RouteStop> stops, int currentIndex) {
        if (currentIndex == 0) {
            return 0;
        }

        double totalDistance = 0.0;
        for (int i = 0; i < currentIndex; i++) {
            Route.RouteStop current = stops.get(i);
            Route.RouteStop next = stops.get(i + 1);
            totalDistance += calculateDistance(current, next);
        }

        // Calculate driving time (in minutes)
        int drivingTime = (int) ((totalDistance / AVERAGE_SPEED) * 60);
        // Add stop time
        int stopTime = currentIndex * BASE_TIME_PER_STOP;
        
        return drivingTime + stopTime;
    }

    private double calculateDistance(Route.RouteStop stop1, Route.RouteStop stop2) {
        // Haversine formula for calculating distance between two points
        double lat1 = Math.toRadians(stop1.getLatitude());
        double lon1 = Math.toRadians(stop1.getLongitude());
        double lat2 = Math.toRadians(stop2.getLatitude());
        double lon2 = Math.toRadians(stop2.getLongitude());
        
        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;
        
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(lat1) * Math.cos(lat2) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        double distance = 6371 * c; // Earth's radius in km
        
        return distance;
    }
} 