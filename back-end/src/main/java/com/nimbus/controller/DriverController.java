package com.nimbus.controller;

import com.nimbus.model.*;
import com.nimbus.payload.response.MessageResponse;
import com.nimbus.repository.*;
import com.nimbus.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/driver")
@PreAuthorize("hasRole('DRIVER')")
public class DriverController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private LocationUpdateRepository locationUpdateRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User driver = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        List<Route> routes = routeRepository.findByDriver(driver);
        List<Trip> activeTrips = tripRepository.findByDriverAndStatus(driver, TripStatus.IN_PROGRESS);
        List<Trip> scheduledTrips = tripRepository.findByDriverAndStatus(driver, TripStatus.SCHEDULED);
        
        Map<String, Object> response = new HashMap<>();
        response.put("driver", driver);
        response.put("routes", routes);
        response.put("activeTrips", activeTrips);
        response.put("scheduledTrips", scheduledTrips);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/routes")
    public ResponseEntity<?> getRoutes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User driver = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        List<Route> routes = routeRepository.findByDriver(driver);
        
        return ResponseEntity.ok(routes);
    }
    
    @PostMapping("/trip/start")
    public ResponseEntity<?> startTrip(@RequestBody Map<String, Long> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User driver = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        Route route = routeRepository.findById(payload.get("routeId"))
                .orElseThrow(() -> new RuntimeException("Error: Route not found."));
        
        // Verify that the route belongs to the driver
        if (!route.getDriver().getId().equals(driver.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not authorized to start a trip for this route."));
        }
        
        // Create a new trip
        Trip trip = new Trip();
        trip.setRoute(route);
        trip.setDriver(driver);
        trip.setActualDepartureTime(LocalTime.ofSecondOfDay(System.currentTimeMillis()));
        trip.setStatus(TripStatus.IN_PROGRESS);
        trip = tripRepository.save(trip);
        
        // Create attendance records for all students on this route
        List<Student> students = studentRepository.findAll().stream()
                .filter(s -> s.getRoute() != null && s.getRoute().getId().equals(route.getId()))
                .toList();
        
        for (Student student : students) {
            Attendance attendance = new Attendance();
            attendance.setTrip(trip);
            attendance.setStudent(student);
            attendance.setPresent(false);
            attendance.setParentConfirmed(false);
            attendanceRepository.save(attendance);
        }
        
        // Notify parents that the trip has started
        messagingTemplate.convertAndSend("/topic/route/" + route.getId() + "/trip/start", trip);
        
        return ResponseEntity.ok(trip);
    }
    
    @PostMapping("/trip/{id}/end")
    public ResponseEntity<?> endTrip(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User driver = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Trip not found."));
        
        // Verify that the trip belongs to the driver
        if (!trip.getDriver().getId().equals(driver.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not authorized to end this trip."));
        }
        
        trip.setActualArrivalTime(LocalTime.ofSecondOfDay(System.currentTimeMillis()));
        trip.setStatus(TripStatus.COMPLETED);
        tripRepository.save(trip);
        
        // Notify parents that the trip has ended
        messagingTemplate.convertAndSend("/topic/route/" + trip.getRoute().getId() + "/trip/end", trip);
        
        return ResponseEntity.ok(trip);
    }
    
    @PostMapping("/scan")
    public ResponseEntity<?> scanQrCode(@RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User driver = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        String qrCode = payload.get("qrCode");
        Long tripId = Long.parseLong(payload.get("tripId"));
        
        Student student = studentRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Error: Student not found for QR code."));
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Error: Trip not found."));
        
        // Verify that the trip belongs to the driver
        if (!trip.getDriver().getId().equals(driver.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not authorized to scan for this trip."));
        }
        
        // Verify that the student is assigned to the route
        if (student.getRoute() == null || !student.getRoute().getId().equals(trip.getRoute().getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: This student is not assigned to this route."));
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
        messagingTemplate.convertAndSend("/topic/student/" + student.getId() + "/board", attendance);
        
        return ResponseEntity.ok(attendance);
    }
    
    @PostMapping("/location")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Object> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User driver = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        Long tripId = Long.parseLong(payload.get("tripId").toString());
        Double latitude = Double.parseDouble(payload.get("latitude").toString());
        Double longitude = Double.parseDouble(payload.get("longitude").toString());
        Double speed = payload.get("speed") != null ? Double.parseDouble(payload.get("speed").toString()) : null;
        Double heading = payload.get("heading") != null ? Double.parseDouble(payload.get("heading").toString()) : null;
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Error: Trip not found."));
        
        // Verify that the trip belongs to the driver
        if (!trip.getDriver().getId().equals(driver.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not authorized to update location for this trip."));
        }
        
        LocationUpdate locationUpdate = new LocationUpdate();
        locationUpdate.setTrip(trip);
        locationUpdate.setLatitude(latitude);
        locationUpdate.setLongitude(longitude);
        locationUpdate.setTimestamp(System.currentTimeMillis());
        locationUpdate.setSpeed(speed);
        locationUpdate.setHeading(heading);
        
        locationUpdateRepository.save(locationUpdate);
        
        // Notify parents about the location update
        messagingTemplate.convertAndSend("/topic/route/" + trip.getRoute().getId() + "/location", locationUpdate);
        
        return ResponseEntity.ok(locationUpdate);
    }
}

