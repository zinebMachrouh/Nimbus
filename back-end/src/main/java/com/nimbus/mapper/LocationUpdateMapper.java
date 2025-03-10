package com.nimbus.mapper;

import com.nimbus.dto.LocationUpdateDTO;
import com.nimbus.model.LocationUpdate;
import org.springframework.stereotype.Component;

@Component
public class LocationUpdateMapper {
    
    public LocationUpdateDTO toDTO(LocationUpdate locationUpdate) {
        if (locationUpdate == null) {
            return null;
        }
        
        LocationUpdateDTO dto = new LocationUpdateDTO();
        dto.setId(locationUpdate.getId());
        dto.setTripId(locationUpdate.getTrip().getId());
        dto.setLatitude(locationUpdate.getLatitude());
        dto.setLongitude(locationUpdate.getLongitude());
        dto.setTimestamp(locationUpdate.getTimestamp());
        dto.setSpeed(locationUpdate.getSpeed());
        dto.setHeading(locationUpdate.getHeading());
        dto.setCreatedAt(locationUpdate.getCreatedAt());
        
        return dto;
    }
}

