package com.nimbus.service;

import com.nimbus.dto.RouteDTO;
import com.nimbus.dto.RouteStopDTO;
import com.nimbus.dto.request.CreateRouteRequest;
import com.nimbus.dto.request.CreateRouteStopRequest;
import com.nimbus.dto.request.UpdateRouteRequest;

import java.util.List;

public interface RouteService {
    List<RouteDTO> getAllRoutes();
    RouteDTO getRouteById(Long id);
    List<RouteDTO> getRoutesByDriverId(Long driverId);
    RouteDTO createRoute(CreateRouteRequest createRouteRequest);
    RouteDTO updateRoute(Long id, UpdateRouteRequest updateRouteRequest);
    void activateRoute(Long id);
    void deactivateRoute(Long id);
    List<RouteStopDTO> getRouteStops(Long routeId);
    RouteStopDTO addRouteStop(Long routeId, CreateRouteStopRequest createRouteStopRequest);
    void removeRouteStop(Long routeId, Long stopId);
    void updateRouteStopOrder(Long routeId, List<Long> stopIds);
}

