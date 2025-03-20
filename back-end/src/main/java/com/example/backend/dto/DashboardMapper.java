package com.example.backend.dto;

import com.example.backend.entities.Route;
import org.springframework.stereotype.Component;

@Component
public class DashboardMapper {
    
    public RouteDTO toRouteDTO(Route route) {
        if (route == null) {
            return null;
        }

        RouteDTO dto = new RouteDTO();
        dto.setId(route.getId());
        dto.setName(route.getName());
        dto.setStatus("ACTIVE"); // Since we're only mapping active routes
        dto.setVehicle("TBD"); // Vehicle info will be added later

        // Get coordinates from the first stop
        if (!route.getStops().isEmpty()) {
            Route.RouteStop firstStop = route.getStops().get(0);
            dto.setLatitude(firstStop.getLatitude());
            dto.setLongitude(firstStop.getLongitude());
        }

        return dto;
    }
} 