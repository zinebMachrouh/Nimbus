package com.nimbus.mapper;

import com.nimbus.dto.RouteDTO;
import com.nimbus.dto.request.UpdateRouteRequest;
import com.nimbus.model.Route;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RouteMapper {
    
    private final UserMapper userMapper;
    private final RouteStopMapper routeStopMapper;
    
    public RouteDTO toDTO(Route route) {
        if (route == null) {
            return null;
        }
        
        RouteDTO dto = new RouteDTO();
        dto.setId(route.getId());
        dto.setName(route.getName());
        dto.setDescription(route.getDescription());
        dto.setDriver(userMapper.toDTO(route.getDriver()));
        
        if (route.getStops() != null) {
            dto.setStops(route.getStops().stream()
                    .map(routeStopMapper::toDTO)
                    .collect(Collectors.toList()));
        }
        
        dto.setActive(route.isActive());
        dto.setStartLocation(route.getStartLocation());
        dto.setEndLocation(route.getEndLocation());
        dto.setScheduledDepartureTime(route.getScheduledDepartureTime());
        dto.setScheduledArrivalTime(route.getScheduledArrivalTime());
        dto.setCreatedAt(route.getCreatedAt());
        dto.setUpdatedAt(route.getUpdatedAt());
        
        return dto;
    }
    
    public void updateRouteFromRequest(UpdateRouteRequest request, Route route) {
        if (request.getName() != null) {
            route.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            route.setDescription(request.getDescription());
        }
        
        if (request.getActive() != null) {
            route.setActive(request.getActive());
        }
    }
}

