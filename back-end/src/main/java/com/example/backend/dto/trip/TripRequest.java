package com.example.backend.dto.trip;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TripRequest {
    @NotNull(message = "Route ID is required")
    private Long routeId;

    @NotNull(message = "Driver ID is required")
    private Long driverId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Scheduled departure time is required")
    private LocalDateTime scheduledDepartureTime;

    private String notes;
} 