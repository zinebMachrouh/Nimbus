package com.nimbus.mapper;

import com.nimbus.dto.TripDTO;
import com.nimbus.model.Trip;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TripMapper {
    
    private final RouteMapper routeMapper;
    private final UserMapper userMapper;
    
    public TripDTO toDTO(Trip trip) {
        if (trip == null) {
            return null;
        }
        
        TripDTO dto = new TripDTO();
        dto.setId(trip.getId());
        dto.setRoute_id(trip.getRoute().getId());
        dto.setDriver_id(trip.getDriver().getId());
        dto.setDate(trip.getDate());
        dto.setScheduledDepartureTime(trip.getScheduledDepartureTime());
        dto.setActualDepartureTime(trip.getActualDepartureTime());
        dto.setActualArrivalTime(trip.getActualArrivalTime());
        dto.setStatus(trip.getStatus());
        dto.setCreatedAt(trip.getCreatedAt());
        dto.setUpdatedAt(trip.getUpdatedAt());
        
        return dto;
    }
}

