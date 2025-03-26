package com.example.backend.dto;

import com.example.backend.dto.base.BaseDTO;
import com.example.backend.entities.Route;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class RouteDTO extends BaseDTO {
    private String name;
    private String description;
    private Long schoolId;
    private String schoolName;
    private Route.RouteType type;
    private Route.RouteStatus status;
    private List<RouteStopDTO> stops = new ArrayList<>();
    private Long activeStudentsCount;
    private Long completedTripsCount;
    private Double totalDistance;
    private Integer estimatedDuration;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteStopDTO {
        private String name;
        private String address;
        private Double latitude;
        private Double longitude;
        private Integer estimatedMinutesFromStart;
    }
}

