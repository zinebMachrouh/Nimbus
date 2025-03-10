package com.nimbus.controller;

import com.nimbus.model.*;
import com.nimbus.payload.response.MessageResponse;
import com.nimbus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private RouteStopRepository routeStopRepository;
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        if (payload.containsKey("fullName")) {
            user.setFullName((String) payload.get("fullName"));
        }
        
        if (payload.containsKey("email")) {
            String email = (String) payload.get("email");
            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            user.setEmail(email);
        }
        
        if (payload.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) payload.get("phoneNumber"));
        }
        
        if (payload.containsKey("address")) {
            user.setAddress((String) payload.get("address"));
        }
        
        if (payload.containsKey("active")) {
            user.setActive((Boolean) payload.get("active"));
        }
        
        if (payload.containsKey("password")) {
            user.setPassword(encoder.encode((String) payload.get("password")));
        }
        
        if (payload.containsKey("roles")) {
            Set<String> strRoles = ((List<String>) payload.get("roles")).stream().collect(Collectors.toSet());
            Set<Role> roles = strRoles.stream()
                    .map(role -> {
                        switch (role) {
                            case "admin":
                                return roleRepository.findByName(ERole.ROLE_ADMIN)
                                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            case "driver":
                                return roleRepository.findByName(ERole.ROLE_DRIVER)
                                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            default:
                                return roleRepository.findByName(ERole.ROLE_PARENT)
                                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        }
                    })
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        return ResponseEntity.ok(students);
    }
    
    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, Object> payload) {
        String fullName = (String) payload.get("fullName");
        String grade = (String) payload.get("grade");
        Long parentId = Long.parseLong(payload.get("parentId").toString());
        Long routeId = payload.get("routeId") != null ? Long.parseLong(payload.get("routeId").toString()) : null;
        Integer seatNumber = payload.get("seatNumber") != null ? Integer.parseInt(payload.get("seatNumber").toString()) : null;
        
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Error: Parent not found."));
        
        // Verify that the parent has the ROLE_PARENT role
        boolean isParent = parent.getRoles().stream()
                .anyMatch(role -> role.getName() == ERole.ROLE_PARENT);
        
        if (!isParent) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not a parent."));
        }
        
        Student student = new Student();
        student.setFullName(fullName);
        student.setGrade(grade);
        student.setParent(parent);
        
        // Generate a unique QR code
        String qrCode = "STU" + System.currentTimeMillis();
        student.setQrCode(qrCode);
        
        if (routeId != null) {
            Route route = routeRepository.findById(routeId)
                    .orElseThrow(() -> new RuntimeException("Error: Route not found."));
            student.setRoute(route);
        }
        
        if (seatNumber != null) {
            student.setSeatNumber(seatNumber);
        }
        
        studentRepository.save(student);
        
        return ResponseEntity.ok(student);
    }
    
    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Student not found."));
        
        if (payload.containsKey("fullName")) {
            student.setFullName((String) payload.get("fullName"));
        }
        
        if (payload.containsKey("grade")) {
            student.setGrade((String) payload.get("grade"));
        }
        
        if (payload.containsKey("parentId")) {
            Long parentId = Long.parseLong(payload.get("parentId").toString());
            User parent = userRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Error: Parent not found."));
            
            // Verify that the parent has the ROLE_PARENT role
            boolean isParent = parent.getRoles().stream()
                    .anyMatch(role -> role.getName() == ERole.ROLE_PARENT);
            
            if (!isParent) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not a parent."));
            }
            
            student.setParent(parent);
        }
        
        if (payload.containsKey("routeId")) {
            if (payload.get("routeId") == null) {
                student.setRoute(null);
            } else {
                Long routeId = Long.parseLong(payload.get("routeId").toString());
                Route route = routeRepository.findById(routeId)
                        .orElseThrow(() -> new RuntimeException("Error: Route not found."));
                student.setRoute(route);
            }
        }
        
        if (payload.containsKey("seatNumber")) {
            student.setSeatNumber(payload.get("seatNumber") != null ? 
                    Integer.parseInt(payload.get("seatNumber").toString()) : null);
        }
        
        if (payload.containsKey("active")) {
            student.setActive((Boolean) payload.get("active"));
        }
        
        studentRepository.save(student);
        
        return ResponseEntity.ok(student);
    }
    
    @GetMapping("/routes")
    public ResponseEntity<?> getAllRoutes() {
        List<Route> routes = routeRepository.findAll();
        return ResponseEntity.ok(routes);
    }
    
    @PostMapping("/routes")
    public ResponseEntity<?> createRoute(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        String startLocation = (String) payload.get("startLocation");
        String endLocation = (String) payload.get("endLocation");
        String scheduledDepartureTime = (String) payload.get("scheduledDepartureTime");
        String scheduledArrivalTime = (String) payload.get("scheduledArrivalTime");
        Long driverId = payload.get("driverId") != null ? Long.parseLong(payload.get("driverId").toString()) : null;
        
        Route route = new Route();
        route.setName(name);
        route.setDescription(description);
        route.setStartLocation(startLocation);
        route.setEndLocation(endLocation);
        route.setScheduledDepartureTime(scheduledDepartureTime);
        route.setScheduledArrivalTime(scheduledArrivalTime);
        
        if (driverId != null) {
            User driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Error: Driver not found."));
            
            // Verify that the user has the ROLE_DRIVER role
            boolean isDriver = driver.getRoles().stream()
                    .anyMatch(role -> role.getName() == ERole.ROLE_DRIVER);
            
            if (!isDriver) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not a driver."));
            }
            
            route.setDriver(driver);
        }
        
        routeRepository.save(route);
        
        return ResponseEntity.ok(route);
    }
    
    @PutMapping("/routes/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Route not found."));
        
        if (payload.containsKey("name")) {
            route.setName((String) payload.get("name"));
        }
        
        if (payload.containsKey("description")) {
            route.setDescription((String) payload.get("description"));
        }
        
        if (payload.containsKey("startLocation")) {
            route.setStartLocation((String) payload.get("startLocation"));
        }
        
        if (payload.containsKey("endLocation")) {
            route.setEndLocation((String) payload.get("endLocation"));
        }
        
        if (payload.containsKey("scheduledDepartureTime")) {
            route.setScheduledDepartureTime((String) payload.get("scheduledDepartureTime"));
        }
        
        if (payload.containsKey("scheduledArrivalTime")) {
            route.setScheduledArrivalTime((String) payload.get("scheduledArrivalTime"));
        }
        
        if (payload.containsKey("driverId")) {
            if (payload.get("driverId") == null) {
                route.setDriver(null);
            } else {
                Long driverId = Long.parseLong(payload.get("driverId").toString());
                User driver = userRepository.findById(driverId)
                        .orElseThrow(() -> new RuntimeException("Error: Driver not found."));
                
                // Verify that the user has the ROLE_DRIVER role
                boolean isDriver = driver.getRoles().stream()
                        .anyMatch(role -> role.getName() == ERole.ROLE_DRIVER);
                
                if (!isDriver) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not a driver."));
                }
                
                route.setDriver(driver);
            }
        }
        
        if (payload.containsKey("active")) {
            route.setActive((Boolean) payload.get("active"));
        }
        
        routeRepository.save(route);
        
        return ResponseEntity.ok(route);
    }
    
    @GetMapping("/routes/{id}/stops")
    public ResponseEntity<?> getRouteStops(@PathVariable Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Route not found."));
        
        List<RouteStop> stops = routeStopRepository.findByRouteOrderByStopOrder(route);
        
        return ResponseEntity.ok(stops);
    }
    
    @PostMapping("/routes/{id}/stops")
    public ResponseEntity<?> addRouteStop(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Route not found."));
        
        String name = (String) payload.get("name");
        Double latitude = Double.parseDouble(payload.get("latitude").toString());
        Double longitude = Double.parseDouble(payload.get("longitude").toString());
        Integer stopOrder = Integer.parseInt(payload.get("stopOrder").toString());
        String scheduledTime = (String) payload.get("scheduledTime");
        
        RouteStop stop = new RouteStop();
        stop.setRoute(route);
        stop.setName(name);
        stop.setLatitude(latitude);
        stop.setLongitude(longitude);
        stop.setStopOrder(stopOrder);
        stop.setScheduledTime(scheduledTime);
        
        routeStopRepository.save(stop);
        
        return ResponseEntity.ok(stop);
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        // Count total users by role
        long totalParents = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_PARENT))
                .count();
        
        long totalDrivers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_DRIVER))
                .count();
        
        long totalAdmins = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN))
                .count();
        
        // Count total students
        long totalStudents = studentRepository.count();
        
        // Count total routes
        long totalRoutes = routeRepository.count();
        
        // Count total trips
        long totalTrips = tripRepository.count();
        long completedTrips = tripRepository.findByStatus(TripStatus.COMPLETED).size();
        long inProgressTrips = tripRepository.findByStatus(TripStatus.IN_PROGRESS).size();
        
        // Calculate attendance statistics
        long totalAttendances = attendanceRepository.count();
        long presentAttendances = attendanceRepository.findAll().stream()
                .filter(Attendance::isPresent)
                .count();
        
        double attendanceRate = totalAttendances > 0 ? 
                (double) presentAttendances / totalAttendances * 100 : 0;
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalParents", totalParents);
        statistics.put("totalDrivers", totalDrivers);
        statistics.put("totalAdmins", totalAdmins);
        statistics.put("totalStudents", totalStudents);
        statistics.put("totalRoutes", totalRoutes);
        statistics.put("totalTrips", totalTrips);
        statistics.put("completedTrips", completedTrips);
        statistics.put("inProgressTrips", inProgressTrips);
        statistics.put("attendanceRate", attendanceRate);
        
        return ResponseEntity.ok(statistics);
    }
}

