package com.example.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardStatsDTO {
    private int totalStudents;
    private int activeRoutes;
    private int totalVehicles;
    private double attendanceRate;
    private List<RouteDTO> activeRoutesList;
}
