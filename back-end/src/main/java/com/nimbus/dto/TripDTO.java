package com.nimbus.dto;

import com.nimbus.model.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private Long id;
    private Long route_id;
    private Long driver_id;
    private LocalDate date;
    private LocalTime scheduledDepartureTime;
    private LocalTime actualDepartureTime;
    private LocalTime actualArrivalTime;
    private TripStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

