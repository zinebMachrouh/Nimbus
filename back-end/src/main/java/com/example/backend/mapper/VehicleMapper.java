package com.example.backend.mapper;

import com.example.backend.dto.vehicle.VehicleDTO;
import com.example.backend.dto.vehicle.VehicleRequest;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Driver;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VehicleMapper extends BaseMapper<Vehicle, VehicleDTO> {
    
    @Override
    @Mapping(target = "currentDrivers", source = "drivers")
    @Mapping(target = "currentTripInfo", expression = "java(getCurrentTripInfo(entity))")
    VehicleDTO toDto(Vehicle entity);

    @Mapping(target = "drivers", ignore = true)
    @Mapping(target = "trips", ignore = true)
    @Mapping(target = "currentLatitude", source = "initialLatitude")
    @Mapping(target = "currentLongitude", source = "initialLongitude")
    @Mapping(target = "licensePlate", source = "vehicleNumber")
    Vehicle toEntity(VehicleRequest request);

    @Mapping(target = "drivers", ignore = true)
    @Mapping(target = "trips", ignore = true)
    @Mapping(target = "licensePlate", source = "vehicleNumber")
    void updateEntity(VehicleRequest request, @MappingTarget Vehicle entity);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", expression = "java(driver.getFirstName() + \" \" + driver.getLastName())")
    @Mapping(target = "licenseNumber", source = "licenseNumber")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    VehicleDTO.DriverInfo driverToDriverInfo(Driver driver);

    default String getCurrentTripInfo(Vehicle vehicle) {
        if (vehicle.getTrips() == null || vehicle.getTrips().isEmpty()) {
            return null;
        }
        return vehicle.getTrips().stream()
                .filter(trip -> trip.getStatus() == com.example.backend.entities.Trip.TripStatus.IN_PROGRESS)
                .findFirst()
                .map(trip -> trip.getRoute().getName() + " - " + trip.getStatus())
                .orElse(null);
    }
} 