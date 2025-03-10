package com.nimbus.service;

import com.nimbus.dto.AttendanceDTO;
import com.nimbus.dto.LocationUpdateDTO;
import com.nimbus.dto.TripDTO;
import com.nimbus.dto.request.CreateLocationUpdateRequest;
import com.nimbus.dto.request.ScanQrCodeRequest;
import com.nimbus.dto.request.StartTripRequest;
import com.nimbus.dto.response.DriverDashboardResponse;
import com.nimbus.dto.response.ParentDashboardResponse;

import java.util.List;

public interface TripService {
    List<TripDTO> getAllTrips();
    TripDTO getTripById(Long id);
    List<TripDTO> getTripsByDriverId(Long driverId);
    List<TripDTO> getTripsByRouteId(Long routeId);
    DriverDashboardResponse getDriverDashboard(Long driverId);
    ParentDashboardResponse getParentDashboard(Long parentId);
    TripDTO startTrip(Long driverId, StartTripRequest startTripRequest);
    TripDTO endTrip(Long driverId, Long tripId);
    AttendanceDTO scanQrCode(Long driverId, ScanQrCodeRequest scanQrCodeRequest);
    LocationUpdateDTO updateLocation(Long driverId, CreateLocationUpdateRequest createLocationUpdateRequest);
    List<AttendanceDTO> getTripAttendances(Long tripId);
    List<LocationUpdateDTO> getTripLocationUpdates(Long tripId);
}

