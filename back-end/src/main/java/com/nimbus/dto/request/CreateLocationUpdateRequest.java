package com.nimbus.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLocationUpdateRequest {
    @NotNull(message = "Trip ID is required")
    private Long tripId;
    
    @NotNull(message = "Latitude is required")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    private Double longitude;
    
    private Double speed;
    
    private Double heading;
}

