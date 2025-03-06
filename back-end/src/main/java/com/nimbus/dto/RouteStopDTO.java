package com.nimbus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteStopDTO {
    private Long id;
    private Long routeId;
    private String name;
    private Double latitude;
    private Double longitude;
    private Integer stopOrder;
}

