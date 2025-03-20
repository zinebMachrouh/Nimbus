package com.example.backend.dto.route;

import com.example.backend.dto.base.BaseDTO;
import com.example.backend.entities.Route;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RouteDTO extends BaseDTO {
    private String name;
    private String description;
    private Long schoolId;
    private String schoolName;
    private Route.RouteType type;
    private List<RouteStopDTO> stops;

    @Getter
    @Setter
    public static class RouteStopDTO {
        private String name;
        private String address;
        private Double latitude;
        private Double longitude;
        private Integer estimatedMinutesFromStart;
    }
} 