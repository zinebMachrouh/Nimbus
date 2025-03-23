package com.example.backend.dto.route;

import com.example.backend.entities.Route;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class RouteRequest {
    @NotBlank(message = "Route name is required")
    private String name;

    private String description;

    @NotNull(message = "Route type is required")
    private Route.RouteType type;

    // For create operations this is required, for updates it's optional
    @Positive(message = "School ID must be a positive number")
    private Long schoolId;

    // Make stops optional - initialize with empty list to avoid null pointer exceptions
    @Valid
    private List<RouteStopRequest> stops = new ArrayList<>();

    @Getter
    @Setter
    public static class RouteStopRequest {
        @NotBlank(message = "Stop name is required")
        private String name;

        @NotBlank(message = "Stop address is required")
        private String address;

        @NotNull(message = "Latitude is required")
        private Double latitude;

        @NotNull(message = "Longitude is required")
        private Double longitude;

        @NotNull(message = "Estimated minutes from start is required")
        private Integer estimatedMinutesFromStart;
        
        // Optional field for sequence
        private Integer sequence;
    }
} 