package com.nimbus.service.impl;

import com.nimbus.dto.response.StatisticsResponse;
import com.nimbus.model.Attendance;
import com.nimbus.model.ERole;
import com.nimbus.model.TripStatus;
import com.nimbus.repository.*;
import com.nimbus.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {
    
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RouteRepository routeRepository;
    private final TripRepository tripRepository;
    private final AttendanceRepository attendanceRepository;
    
    @Override
    public StatisticsResponse getStatistics() {
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
        
        StatisticsResponse statistics = new StatisticsResponse();
        statistics.setTotalParents(totalParents);
        statistics.setTotalDrivers(totalDrivers);
        statistics.setTotalAdmins(totalAdmins);
        statistics.setTotalStudents(totalStudents);
        statistics.setTotalRoutes(totalRoutes);
        statistics.setTotalTrips(totalTrips);
        statistics.setCompletedTrips(completedTrips);
        statistics.setInProgressTrips(inProgressTrips);
        statistics.setAttendanceRate(attendanceRate);
        
        return statistics;
    }
}

