package com.example.backend.dto.trip;

import com.example.backend.entities.Trip;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TripStatusUpdateRequest {
    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotNull(message = "Status is required")
    private Trip.TripStatus status;

    private LocalDateTime timestamp;
    private Double latitude;
    private Double longitude;
    private String notes;
} 