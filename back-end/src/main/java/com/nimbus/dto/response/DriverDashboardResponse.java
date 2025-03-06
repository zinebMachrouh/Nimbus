package com.nimbus.dto.response;

import com.nimbus.dto.RouteDTO;
import com.nimbus.dto.TripDTO;
import com.nimbus.model.Driver;
import lombok.Data;

import java.util.List;

@Data
public class DriverDashboardResponse {
    private Driver driver;
    private List<RouteDTO> routes;
    private List<TripDTO> activeTrips;
    private List<TripDTO> scheduledTrips;
}

