package com.nimbus.service.impl;

import com.nimbus.dto.RouteDTO;
import com.nimbus.dto.RouteStopDTO;
import com.nimbus.dto.request.CreateRouteRequest;
import com.nimbus.dto.request.CreateRouteStopRequest;
import com.nimbus.dto.request.UpdateRouteRequest;
import com.nimbus.exception.ResourceNotFoundException;
import com.nimbus.mapper.RouteMapper;
import com.nimbus.mapper.RouteStopMapper;
import com.nimbus.model.Driver;
import com.nimbus.model.Route;
import com.nimbus.model.RouteStop;
import com.nimbus.repository.DriverRepository;
import com.nimbus.repository.RouteRepository;
import com.nimbus.repository.RouteStopRepository;
import com.nimbus.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteServiceImpl implements RouteService {
    
    private final RouteRepository routeRepository;
    private final RouteStopRepository routeStopRepository;
    private final DriverRepository driverRepository;
    private final RouteMapper routeMapper;
    private final RouteStopMapper routeStopMapper;
    
    @Override
    public List<RouteDTO> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(routeMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public RouteDTO getRouteById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        return routeMapper.toDTO(route);
    }
    
    @Override
    public List<RouteDTO> getRoutesByDriverId(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        return routeRepository.findByDriver(driver).stream()
                .map(routeMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public RouteDTO createRoute(CreateRouteRequest createRouteRequest) {
        Route route = new Route();
        route.setName(createRouteRequest.getName());
        route.setDescription(createRouteRequest.getDescription());
        route.setActive(true);
        
        if (createRouteRequest.getDriverId() != null) {
            Driver driver = driverRepository.findById(createRouteRequest.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + createRouteRequest.getDriverId()));
            route.setDriver(driver);
        }
        
        Route savedRoute = routeRepository.save(route);
        return routeMapper.toDTO(savedRoute);
    }
    
    @Override
    @Transactional
    public RouteDTO updateRoute(Long id, UpdateRouteRequest updateRouteRequest) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        
        if (updateRouteRequest.getDriverId() != null) {
            Driver driver = driverRepository.findById(updateRouteRequest.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + updateRouteRequest.getDriverId()));
            route.setDriver(driver);
        } else if (updateRouteRequest.getDriverId() == null && updateRouteRequest.isDriverIdPresent()) {
            route.setDriver(null);
        }
        
        routeMapper.updateRouteFromRequest(updateRouteRequest, route);
        Route updatedRoute = routeRepository.save(route);
        return routeMapper.toDTO(updatedRoute);
    }
    
    @Override
    @Transactional
    public void activateRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        route.setActive(true);
        routeRepository.save(route);
    }
    
    @Override
    @Transactional
    public void deactivateRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        route.setActive(false);
        routeRepository.save(route);
    }
    
    @Override
    public List<RouteStopDTO> getRouteStops(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));
        
        return routeStopRepository.findByRouteOrderByStopOrder(route).stream()
                .map(routeStopMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public RouteStopDTO addRouteStop(Long routeId, CreateRouteStopRequest createRouteStopRequest) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));
        
        RouteStop routeStop = new RouteStop();
        routeStop.setRoute(route);
        routeStop.setName(createRouteStopRequest.getName());
        routeStop.setLatitude(createRouteStopRequest.getLatitude());
        routeStop.setLongitude(createRouteStopRequest.getLongitude());
        routeStop.setStopOrder(createRouteStopRequest.getSequenceNumber());
        
        RouteStop savedRouteStop = routeStopRepository.save(routeStop);
        return routeStopMapper.toDTO(savedRouteStop);
    }
    
    @Override
    @Transactional
    public void removeRouteStop(Long routeId, Long stopId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));
        
        RouteStop routeStop = routeStopRepository.findById(stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Route stop not found with id: " + stopId));
        
        if (!routeStop.getRoute().getId().equals(route.getId())) {
            throw new IllegalArgumentException("Route stop does not belong to the specified route");
        }
        
        routeStopRepository.delete(routeStop);
    }
    
    @Override
    @Transactional
    public void updateRouteStopOrder(Long routeId, List<Long> stopIds) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));
        
        List<RouteStop> stops = routeStopRepository.findByRouteOrderByStopOrder(route);
        
        if (stops.size() != stopIds.size()) {
            throw new IllegalArgumentException("The number of stops in the request does not match the number of stops in the route");
        }
        
        for (int i = 0; i < stopIds.size(); i++) {
            Long stopId = stopIds.get(i);
            RouteStop stop = stops.stream()
                    .filter(s -> s.getId().equals(stopId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Route stop not found with id: " + stopId));
            
            stop.setStopOrder(i + 1);
            routeStopRepository.save(stop);
        }
    }
}

