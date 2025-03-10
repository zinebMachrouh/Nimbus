package com.nimbus.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateRouteRequest {
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;
    
    private Long driverId;
    private boolean driverIdPresent;
    
    private Boolean active;
}

