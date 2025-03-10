package com.nimbus.config;

import com.nimbus.model.Route;
import com.nimbus.model.Trip;
import com.nimbus.model.TripStatus;
import com.nimbus.repository.LocationUpdateRepository;
import com.nimbus.repository.RouteRepository;
import com.nimbus.repository.TripRepository;
import com.nimbus.service.MessageService;
import com.nimbus.service.StatisticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Configuration
@EnableScheduling
public class SchedulingConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(SchedulingConfig.class);
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private LocationUpdateRepository locationUpdateRepository;
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private StatisticsService statisticsService;
    
    /**
     * Create scheduled trips for the next day at midnight
     * Runs every day at 00:00
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void createScheduledTrips() {
        logger.info("Creating scheduled trips for {}", LocalDate.now().plusDays(1));
        
        List<Route> activeRoutes = routeRepository.findByActive(true);
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        
        for (Route route : activeRoutes) {
            if (route.getDriver() != null) {
                Trip trip = new Trip();
                trip.setRoute(route);
                trip.setDriver(route.getDriver());
                trip.setDate(tomorrow);
                trip.setScheduledDepartureTime(LocalTime.of(7, 30)); // Default time, can be customized
                trip.setStatus(TripStatus.SCHEDULED);
                
                tripRepository.save(trip);
                logger.debug("Created scheduled trip for route: {}", route.getName());
            } else {
                logger.warn("Route {} has no assigned driver, skipping trip creation", route.getName());
            }
        }
        
        logger.info("Finished creating scheduled trips");
    }
    
    /**
     * Send reminders to parents about upcoming trips
     * Runs every day at 18:00 (6 PM)
     */
    @Scheduled(cron = "0 0 18 * * ?")
    public void sendTripReminders() {
        logger.info("Sending trip reminders for tomorrow");
        
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Trip> tomorrowTrips = tripRepository.findByDateAndStatus(tomorrow, TripStatus.SCHEDULED);
        
        for (Trip trip : tomorrowTrips) {
            // Logic to send reminders to parents of students on this route
            // This would typically use the MessageService to send notifications
            logger.debug("Sending reminders for trip on route: {}", trip.getRoute().getName());
        }
        
        logger.info("Finished sending trip reminders");
    }
    
    /**
     * Clean up old location data to prevent database bloat
     * Runs every Sunday at 01:00 AM
     */
    @Scheduled(cron = "0 0 1 ? * SUN")
    public void cleanupOldLocationData() {
        logger.info("Cleaning up old location data");
        
        // Delete location updates older than 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        long timestamp = thirtyDaysAgo.toEpochSecond(java.time.ZoneOffset.UTC) * 1000;
        
        int deletedCount = locationUpdateRepository.deleteByTimestampBefore(timestamp);
        
        logger.info("Deleted {} old location updates", deletedCount);
    }
    
    /**
     * Auto-complete trips that were started but not ended
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void autoCompleteTrips() {
        logger.info("Checking for trips to auto-complete");
        
        List<Trip> inProgressTrips = tripRepository.findByStatus(TripStatus.IN_PROGRESS);
        LocalDateTime fourHoursAgo = LocalDateTime.now().minus(4, ChronoUnit.HOURS);
        
        for (Trip trip : inProgressTrips) {
            // If the trip was started more than 4 hours ago, auto-complete it
            if (trip.getCreatedAt().isBefore(fourHoursAgo)) {
                trip.setStatus(TripStatus.COMPLETED);
                trip.setActualArrivalTime(LocalTime.now());
                tripRepository.save(trip);
                
                logger.debug("Auto-completed trip: {}", trip.getId());
            }
        }
    }
    
    /**
     * Generate daily statistics report
     * Runs every day at 23:00 (11 PM)
     */
    @Scheduled(cron = "0 0 23 * * ?")
    public void generateDailyStatistics() {
        logger.info("Generating daily statistics report");
        
        // Get statistics and log them or store them for reporting
        statisticsService.getStatistics();
        
        logger.info("Daily statistics report generated");
    }
}

