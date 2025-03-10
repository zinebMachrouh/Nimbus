package com.nimbus.controller;

import com.nimbus.model.*;
import com.nimbus.payload.response.MessageResponse;
import com.nimbus.repository.*;
import com.nimbus.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/parent")
@PreAuthorize("hasRole('PARENT')")
public class ParentController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private LocationUpdateRepository locationUpdateRepository;
    @Autowired
    private ParentRepository parentRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Parent parent = parentRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        List<Student> students = studentRepository.findByParent(parent);
        
        Map<String, Object> response = new HashMap<>();
        response.put("parent", parent);
        response.put("students", students);
        
        // Get active trips for each student
        Map<Long, Object> activeTrips = new HashMap<>();
        for (Student student : students) {
            if (student.getRoute() != null) {
                List<Trip> trips = tripRepository.findByRouteAndStatus(student.getRoute(), TripStatus.IN_PROGRESS);
                if (!trips.isEmpty()) {
                    Trip activeTrip = trips.get(0);
                    LocationUpdate latestLocation = locationUpdateRepository.findFirstByTripOrderByTimestampDesc(activeTrip);
                    Optional<Attendance> attendance = attendanceRepository.findByTripAndStudent(activeTrip, student);
                    
                    Map<String, Object> tripInfo = new HashMap<>();
                    tripInfo.put("trip", activeTrip);
                    tripInfo.put("location", latestLocation);
                    tripInfo.put("attendance", attendance.orElse(null));
                    
                    activeTrips.put(student.getId(), tripInfo);
                }
            }
        }
        
        response.put("activeTrips", activeTrips);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Parent parent = parentRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        List<Student> students = studentRepository.findByParent(parent);
        
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/student/{id}/history")
    public ResponseEntity<?> getStudentHistory(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User parent = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Student not found."));
        
        // Verify that the student belongs to the parent
        if (!student.getParent().getId().equals(parent.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not authorized to view this student's history."));
        }
        
        List<Attendance> attendances = attendanceRepository.findByStudent(student);
        
        return ResponseEntity.ok(attendances);
    }
    
    @PutMapping("/attendance/{id}/confirm")
    public ResponseEntity<?> confirmAttendance(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User parent = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Attendance record not found."));
        
        // Verify that the attendance record belongs to a student of the parent
        if (!attendance.getStudent().getParent().getId().equals(parent.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not authorized to confirm this attendance."));
        }
        
        attendance.setParentConfirmed(true);
        attendance.setParentNote(payload.get("note"));
        attendanceRepository.save(attendance);
        
        return ResponseEntity.ok(new MessageResponse("Attendance confirmed successfully."));
    }
}

