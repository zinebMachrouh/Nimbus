package com.example.backend.mapper;

import com.example.backend.dto.trip.TripDTO;
import com.example.backend.dto.trip.TripRequest;
import com.example.backend.entities.Trip;
import org.mapstruct.*;

@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {AttendanceMapper.class})
public interface TripMapper extends BaseMapper<Trip, TripDTO> {
    
    @Override
    @Mapping(target = "routeId", source = "route.id")
    @Mapping(target = "routeName", source = "route.name")
    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "driverName", expression = "java(entity.getDriver() != null ? entity.getDriver().getFirstName() + \" \" + entity.getDriver().getLastName() : null)")
    @Mapping(target = "vehicleId", source = "vehicle.id")
    @Mapping(target = "vehicleNumber", source = "vehicle.vehicleNumber")
    @Mapping(target = "currentLatitude", source = "vehicle.currentLatitude")
    @Mapping(target = "currentLongitude", source = "vehicle.currentLongitude")
    @Mapping(target = "currentSpeed", source = "vehicle.currentSpeed")
    TripDTO toDto(Trip entity);

    @Mapping(target = "route", ignore = true)
    @Mapping(target = "driver", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "attendances", ignore = true)
    @Mapping(target = "actualDepartureTime", ignore = true)
    @Mapping(target = "actualArrivalTime", ignore = true)
    @Mapping(target = "status", constant = "SCHEDULED")
    Trip toEntity(TripRequest request);

    @Mapping(target = "route", ignore = true)
    @Mapping(target = "driver", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "attendances", ignore = true)
    void updateEntity(TripRequest request, @MappingTarget Trip entity);
} 