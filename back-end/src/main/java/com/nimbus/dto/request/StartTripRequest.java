package com.nimbus.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartTripRequest {
    @NotNull(message = "Route ID is required")
    private Long routeId;
}

