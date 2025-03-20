package com.example.backend.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DriverDTO extends UserDTO {
    private String licenseNumber;
    private boolean available;
    private Long currentVehicleId;
    private String currentVehicleNumber;
    private List<TripSummary> upcomingTrips;
    private TripSummary currentTrip;

    @Getter
    @Setter
    public static class TripSummary {
        private Long tripId;
        private String routeName;
        private String scheduledDepartureTime;
        private Integer totalStudents;
        private String status;
    }
} 