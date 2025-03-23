package com.example.backend.dto.route;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StopRequest {
    @NotBlank(message = "Stop name is required")
    private String name;
    
    private String address;
    
    @NotNull(message = "Latitude is required")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    private Double longitude;
    
    @NotNull(message = "Sequence is required")
    private Integer sequence;
    
    @PositiveOrZero(message = "Estimated minutes must be zero or positive")
    private Integer estimatedMinutesFromStart;
} 