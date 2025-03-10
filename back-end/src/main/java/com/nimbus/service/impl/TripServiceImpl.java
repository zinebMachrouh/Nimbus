package com.nimbus.service.impl;

import com.nimbus.dto.AttendanceDTO;
import com.nimbus.dto.LocationUpdateDTO;
import com.nimbus.dto.RouteDTO;
import com.nimbus.dto.TripDTO;
import com.nimbus.dto.request.CreateLocationUpdateRequest;
import com.nimbus.dto.request.ScanQrCodeRequest;
import com.nimbus.dto.request.StartTripRequest;
import com.nimbus.dto.response.DriverDashboardResponse;
import com.nimbus.dto.response.ParentDashboardResponse;
import com.nimbus.exception.ResourceNotFoundException;
import com.nimbus.exception.UnauthorizedException;
import com.nimbus.mapper.AttendanceMapper;
import com.nimbus.mapper.LocationUpdateMapper;
import com.nimbus.mapper.RouteMapper;
import com.nimbus.mapper.TripMapper;
import com.nimbus.model.*;
import com.nimbus.repository.*;
import com.nimbus.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CachePut;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {
    
    private final TripRepository tripRepository;
    private final RouteRepository routeRepository;
    private final DriverRepository driverRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LocationUpdateRepository locationUpdateRepository;
    private final ParentRepository parentRepository;
    private final TripMapper tripMapper;
    private final AttendanceMapper attendanceMapper;
    private final LocationUpdateMapper locationUpdateMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final RouteMapper routeMapper;
    
    @Override
    public List<TripDTO> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(tripMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public TripDTO getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        return tripMapper.toDTO(trip);
    }
    
    @Override
    public List<TripDTO> getTripsByDriverId(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        return tripRepository.findByDriver(driver).stream()
                .map(tripMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TripDTO> getTripsByRouteId(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));
        
        return tripRepository.findByRoute(route).stream()
                .map(tripMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public DriverDashboardResponse getDriverDashboard(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        List<Route> routes = routeRepository.findByDriver(driver);
        List<Trip> activeTrips = tripRepository.findByDriverAndStatus(driver, TripStatus.IN_PROGRESS);
        List<Trip> scheduledTrips = tripRepository.findByDriverAndStatus(driver, TripStatus.SCHEDULED);
        
        DriverDashboardResponse response = new DriverDashboardResponse();
        response.setDriver(driver);
        response.setRoutes(routes.stream().map(routeMapper::toDTO).collect(Collectors.toList()));
        response.setActiveTrips(activeTrips.stream().map(tripMapper::toDTO).collect(Collectors.toList()));
        response.setScheduledTrips(scheduledTrips.stream().map(tripMapper::toDTO).collect(Collectors.toList()));
        
        return response;
    }
    
    @Override
    public ParentDashboardResponse getParentDashboard(Long parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + parentId));
        
        List<Student> students = studentRepository.findByParent(parent);
        
        ParentDashboardResponse response = new ParentDashboardResponse();
        response.setParent(parent);
        response.setStudents(students);
        
        // Get active trips for each student
        Map<Long, Map<String, Object>> activeTrips = new HashMap<>();
        for (Student student : students) {
            if (student.getRoute() != null) {
                List<Trip> trips = tripRepository.findByRouteAndStatus(student.getRoute(), TripStatus.IN_PROGRESS);
                if (!trips.isEmpty()) {
                    Trip activeTrip = trips.get(0);
                    LocationUpdate latestLocation = locationUpdateRepository.findFirstByTripOrderByTimestampDesc(activeTrip);
                    Optional<Attendance> attendance = attendanceRepository.findByTripAndStudent(activeTrip, student);
                    
                    Map<String, Object> tripInfo = new HashMap<>();
                    tripInfo.put("trip", tripMapper.toDTO(activeTrip));
                    tripInfo.put("location", latestLocation != null ? locationUpdateMapper.toDTO(latestLocation) : null);
                    tripInfo.put("attendance", attendance.isPresent() ? attendanceMapper.toDTO(attendance.get()) : null);
                    
                    activeTrips.put(student.getId(), tripInfo);
                }
            }
        }
        
        response.setActiveTrips(activeTrips);
        
        return response;
    }
    
    @Override
    @Transactional
    public TripDTO startTrip(Long driverId, StartTripRequest startTripRequest) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        Route route = routeRepository.findById(startTripRequest.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + startTripRequest.getRouteId()));
        
        // Verify that the route belongs to the driver
        if (route.getDriver() == null || !route.getDriver().getId().equals(driver.getId())) {
            throw new UnauthorizedException("You are not authorized to start a trip for this route");
        }
        
        // Create a new trip
        Trip trip = new Trip();
        trip.setRoute(route);
        trip.setDriver(driver);
        trip.setDate(LocalDate.now());
        trip.setScheduledDepartureTime(LocalTime.now());
        trip.setStatus(TripStatus.IN_PROGRESS);
        trip = tripRepository.save(trip);
        
        // Create attendance records for all students on this route
        List<Student> students = studentRepository.findAll().stream()
                .filter(s -> s.getRoute() != null && s.getRoute().getId().equals(route.getId()))
                .collect(Collectors.toList());
        
        for (Student student : students) {
            Attendance attendance = new Attendance();
            attendance.setTrip(trip);
            attendance.setStudent(student);
            attendance.setPresent(false);
            attendance.setParentConfirmed(false);
            attendanceRepository.save(attendance);
        }
        
        // Notify parents that the trip has started
        messagingTemplate.convertAndSend("/topic/route/" + route.getId() + "/trip/start", tripMapper.toDTO(trip));
        
        return tripMapper.toDTO(trip);
    }
    
    @Override
    @Transactional
    public TripDTO endTrip(Long driverId, Long tripId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        // Verify that the trip belongs to the driver
        if (!trip.getDriver().getId().equals(driver.getId())) {
            throw new UnauthorizedException("You are not authorized to end this trip");
        }
        
        trip.setActualArrivalTime(LocalTime.now());
        trip.setStatus(TripStatus.COMPLETED);
        tripRepository.save(trip);
        
        // Notify parents that the trip has ended
        messagingTemplate.convertAndSend("/topic/route/" + trip.getRoute().getId() + "/trip/end", tripMapper.toDTO(trip));
        
        return tripMapper.toDTO(trip);
    }
    
    @Override
    @Transactional
    public AttendanceDTO scanQrCode(Long driverId, ScanQrCodeRequest scanQrCodeRequest) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        String qrCode = scanQrCodeRequest.getQrCode();
        Long tripId = scanQrCodeRequest.getTripId();
        
        Student student = studentRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for QR code: " + qrCode));
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        // Verify that the trip belongs to the driver
        if (!trip.getDriver().getId().equals(driver.getId())) {
            throw new UnauthorizedException("You are not authorized to scan for this trip");
        }
        
        // Verify that the student is assigned to the route
        if (student.getRoute() == null || !student.getRoute().getId().equals(trip.getRoute().getId())) {
            throw new IllegalArgumentException("This student is not assigned to this route");
        }
        
        // Update or create attendance record
        Optional<Attendance> existingAttendance = attendanceRepository.findByTripAndStudent(trip, student);
        Attendance attendance;
        
        if (existingAttendance.isPresent()) {
            attendance = existingAttendance.get();
        } else {
            attendance = new Attendance();
            attendance.setTrip(trip);
            attendance.setStudent(student);
        }
        
        attendance.setPresent(true);
        attendance.setBoardingTime(System.currentTimeMillis());
        
        // Get current location
        LocationUpdate latestLocation = locationUpdateRepository.findFirstByTripOrderByTimestampDesc(trip);
        if (latestLocation != null) {
            attendance.setBoardingLocation(latestLocation.getLatitude() + "," + latestLocation.getLongitude());
        }
        
        attendanceRepository.save(attendance);
        
        // Notify parents that their child has boarded
        AttendanceDTO attendanceDTO = attendanceMapper.toDTO(attendance);
        messagingTemplate.convertAndSend("/topic/student/" + student.getId() + "/board", attendanceDTO);
        
        return attendanceDTO;
    }
    
    @Async("locationExecutor")
    @CachePut(value = "locations", key = "#createLocationUpdateRequest.tripId")
    @Override
    public LocationUpdateDTO updateLocation(Long driverId, CreateLocationUpdateRequest createLocationUpdateRequest) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
        
        Trip trip = tripRepository.findById(createLocationUpdateRequest.getTripId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + createLocationUpdateRequest.getTripId()));
        
        // Verify that the trip belongs to the driver
        if (!trip.getDriver().getId().equals(driver.getId())) {
            throw new UnauthorizedException("You are not authorized to update location for this trip");
        }
        
        LocationUpdate locationUpdate = new LocationUpdate();
        locationUpdate.setTrip(trip);
        locationUpdate.setLatitude(createLocationUpdateRequest.getLatitude());
        locationUpdate.setLongitude(createLocationUpdateRequest.getLongitude());
        locationUpdate.setTimestamp(System.currentTimeMillis());
        locationUpdate.setSpeed(createLocationUpdateRequest.getSpeed());
        locationUpdate.setHeading(createLocationUpdateRequest.getHeading());
        
        locationUpdateRepository.save(locationUpdate);
        
        // Notify parents about the location update
        LocationUpdateDTO locationUpdateDTO = locationUpdateMapper.toDTO(locationUpdate);
        messagingTemplate.convertAndSend("/topic/route/" + trip.getRoute().getId() + "/location", locationUpdateDTO);
        
        return locationUpdateDTO;
    }
    
    @Override
    public List<AttendanceDTO> getTripAttendances(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        return attendanceRepository.findByTrip(trip).stream()
                .map(attendanceMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<LocationUpdateDTO> getTripLocationUpdates(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        return locationUpdateRepository.findByTripOrderByTimestampDesc(trip).stream()
                .map(locationUpdateMapper::toDTO)
                .collect(Collectors.toList());
    }
}

