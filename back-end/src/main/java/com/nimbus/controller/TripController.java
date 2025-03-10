package com.nimbus.controller;

import com.nimbus.dto.AttendanceDTO;
import com.nimbus.dto.LocationUpdateDTO;
import com.nimbus.dto.TripDTO;
import com.nimbus.dto.request.CreateLocationUpdateRequest;
import com.nimbus.dto.request.ScanQrCodeRequest;
import com.nimbus.dto.request.StartTripRequest;
import com.nimbus.dto.response.DriverDashboardResponse;
import com.nimbus.dto.response.MessageResponse;
import com.nimbus.dto.response.ParentDashboardResponse;
import com.nimbus.service.TripService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips")
public class TripController {
    
    @Autowired
    private TripService tripService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TripDTO>> getAllTrips() {
        List<TripDTO> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER') or hasRole('PARENT')")
    public ResponseEntity<TripDTO> getTripById(@PathVariable Long id) {
        TripDTO trip = tripService.getTripById(id);
        return ResponseEntity.ok(trip);
    }
    
    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#driverId, authentication)")
    public ResponseEntity<List<TripDTO>> getTripsByDriverId(@PathVariable Long driverId) {
        List<TripDTO> trips = tripService.getTripsByDriverId(driverId);
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/route/{routeId}")
    public ResponseEntity<List<TripDTO>> getTripsByRouteId(@PathVariable Long routeId) {
        List<TripDTO> trips = tripService.getTripsByRouteId(routeId);
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/driver/{driverId}/dashboard")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#driverId, authentication)")
    public ResponseEntity<DriverDashboardResponse> getDriverDashboard(@PathVariable Long driverId) {
        DriverDashboardResponse dashboard = tripService.getDriverDashboard(driverId);
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/parent/{parentId}/dashboard")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#parentId, authentication)")
    public ResponseEntity<ParentDashboardResponse> getParentDashboard(@PathVariable Long parentId) {
        ParentDashboardResponse dashboard = tripService.getParentDashboard(parentId);
        return ResponseEntity.ok(dashboard);
    }
    
    @PostMapping("/driver/{driverId}/start")
    @PreAuthorize("hasRole('DRIVER') and @userSecurity.isCurrentUser(#driverId, authentication)")
    public ResponseEntity<TripDTO> startTrip(@PathVariable Long driverId, @Valid @RequestBody StartTripRequest startTripRequest) {
        TripDTO trip = tripService.startTrip(driverId, startTripRequest);
        return ResponseEntity.ok(trip);
    }
    
    @PutMapping("/driver/{driverId}/end/{tripId}")
    @PreAuthorize("hasRole('DRIVER') and @userSecurity.isCurrentUser(#driverId, authentication)")
    public ResponseEntity<TripDTO> endTrip(@PathVariable Long driverId, @PathVariable Long tripId) {
        TripDTO trip = tripService.endTrip(driverId, tripId);
        return ResponseEntity.ok(trip);
    }
    
    @PostMapping("/driver/{driverId}/scan")
    @PreAuthorize("hasRole('DRIVER') and @userSecurity.isCurrentUser(#driverId, authentication)")
    public ResponseEntity<AttendanceDTO> scanQrCode(@PathVariable Long driverId, @Valid @RequestBody ScanQrCodeRequest scanQrCodeRequest) {
        AttendanceDTO attendance = tripService.scanQrCode(driverId, scanQrCodeRequest);
        return ResponseEntity.ok(attendance);
    }
    
    @PostMapping("/driver/{driverId}/location")
    @PreAuthorize("hasRole('DRIVER') and @userSecurity.isCurrentUser(#driverId, authentication)")
    public ResponseEntity<LocationUpdateDTO> updateLocation(@PathVariable Long driverId, @Valid @RequestBody CreateLocationUpdateRequest createLocationUpdateRequest) {
        LocationUpdateDTO locationUpdate = tripService.updateLocation(driverId, createLocationUpdateRequest);
        return ResponseEntity.ok(locationUpdate);
    }
    
    @GetMapping("/{tripId}/attendances")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<List<AttendanceDTO>> getTripAttendances(@PathVariable Long tripId) {
        List<AttendanceDTO> attendances = tripService.getTripAttendances(tripId);
        return ResponseEntity.ok(attendances);
    }
    
    @GetMapping("/{tripId}/locations")
    public ResponseEntity<List<LocationUpdateDTO>> getTripLocationUpdates(@PathVariable Long tripId) {
        List<LocationUpdateDTO> locationUpdates = tripService.getTripLocationUpdates(tripId);
        return ResponseEntity.ok(locationUpdates);
    }
}

