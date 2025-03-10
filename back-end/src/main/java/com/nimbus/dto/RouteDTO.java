package com.nimbus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDTO {
    private Long id;
    private String name;
    private String description;
    private UserDTO driver;
    private List<RouteStopDTO> stops;
    private boolean active;
    private String startLocation;
    private String endLocation;
    private String scheduledDepartureTime;
    private String scheduledArrivalTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

