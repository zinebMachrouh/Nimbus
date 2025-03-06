package com.nimbus.mapper;

import com.nimbus.dto.RouteStopDTO;
import com.nimbus.model.RouteStop;
import org.springframework.stereotype.Component;

@Component
public class RouteStopMapper {
    
    public RouteStopDTO toDTO(RouteStop routeStop) {
        if (routeStop == null) {
            return null;
        }
        
        RouteStopDTO dto = new RouteStopDTO();
        dto.setId(routeStop.getId());
        dto.setName(routeStop.getName());
        dto.setLatitude(routeStop.getLatitude());
        dto.setLongitude(routeStop.getLongitude());
        dto.setStopOrder(routeStop.getStopOrder());
        
        return dto;
    }
}

