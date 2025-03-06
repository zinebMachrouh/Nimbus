package com.nimbus.controller;

import com.nimbus.dto.RouteDTO;
import com.nimbus.dto.RouteStopDTO;
import com.nimbus.dto.request.CreateRouteRequest;
import com.nimbus.dto.request.CreateRouteStopRequest;
import com.nimbus.dto.request.UpdateRouteRequest;
import com.nimbus.dto.response.MessageResponse;
import com.nimbus.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/routes")
public class RouteController {
    
    @Autowired
    private RouteService routeService;
    
    @GetMapping
    public ResponseEntity<List<RouteDTO>> getAllRoutes() {
        List<RouteDTO> routes = routeService.getAllRoutes();
        return ResponseEntity.ok(routes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RouteDTO> getRouteById(@PathVariable Long id) {
        RouteDTO route = routeService.getRouteById(id);
        return ResponseEntity.ok(route);
    }
    
    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#driverId, authentication)")
    public ResponseEntity<List<RouteDTO>> getRoutesByDriverId(@PathVariable Long driverId) {
        List<RouteDTO> routes = routeService.getRoutesByDriverId(driverId);
        return ResponseEntity.ok(routes);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteDTO> createRoute(@Valid @RequestBody CreateRouteRequest createRouteRequest) {
        RouteDTO createdRoute = routeService.createRoute(createRouteRequest);
        return ResponseEntity.ok(createdRoute);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteDTO> updateRoute(@PathVariable Long id, @Valid @RequestBody UpdateRouteRequest updateRouteRequest) {
        RouteDTO updatedRoute = routeService.updateRoute(id, updateRouteRequest);
        return ResponseEntity.ok(updatedRoute);
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateRoute(@PathVariable Long id) {
        routeService.activateRoute(id);
        return ResponseEntity.ok(new MessageResponse("Route activated successfully"));
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateRoute(@PathVariable Long id) {
        routeService.deactivateRoute(id);
        return ResponseEntity.ok(new MessageResponse("Route deactivated successfully"));
    }
    
    @GetMapping("/{routeId}/stops")
    public ResponseEntity<List<RouteStopDTO>> getRouteStops(@PathVariable Long routeId) {
        List<RouteStopDTO> stops = routeService.getRouteStops(routeId);
        return ResponseEntity.ok(stops);
    }
    
    @PostMapping("/{routeId}/stops")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteStopDTO> addRouteStop(@PathVariable Long routeId, @Valid @RequestBody CreateRouteStopRequest createRouteStopRequest) {
        RouteStopDTO createdStop = routeService.addRouteStop(routeId, createRouteStopRequest);
        return ResponseEntity.ok(createdStop);
    }
    
    @DeleteMapping("/{routeId}/stops/{stopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeRouteStop(@PathVariable Long routeId, @PathVariable Long stopId) {
        routeService.removeRouteStop(routeId, stopId);
        return ResponseEntity.ok(new MessageResponse("Route stop removed successfully"));
    }
    
    @PutMapping("/{routeId}/stops/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRouteStopOrder(@PathVariable Long routeId, @RequestBody List<Long> stopIds) {
        routeService.updateRouteStopOrder(routeId, stopIds);
        return ResponseEntity.ok(new MessageResponse("Route stop order updated successfully"));
    }
}

