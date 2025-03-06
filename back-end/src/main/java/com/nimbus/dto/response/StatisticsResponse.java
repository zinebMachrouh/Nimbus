package com.nimbus.dto.response;

import lombok.Data;

@Data
public class StatisticsResponse {
    private long totalParents;
    private long totalDrivers;
    private long totalAdmins;
    private long totalStudents;
    private long totalRoutes;
    private long totalTrips;
    private long completedTrips;
    private long inProgressTrips;
    private double attendanceRate;
}

