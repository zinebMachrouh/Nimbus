package com.example.backend.mapper;

import com.example.backend.dto.vehicle.VehicleDTO;
import com.example.backend.dto.vehicle.VehicleDetailsDTO;
import com.example.backend.dto.vehicle.VehicleRequest;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Driver;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

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

@Component
class VehicleMapperImpl implements VehicleMapper {

    @Override
    public VehicleDTO toDto(Vehicle entity) {
        return toVehicleDTO(entity);
    }

    @Override
    public Vehicle toEntity(VehicleDTO dto) {
        // Not used directly in this implementation
        throw new UnsupportedOperationException("Direct mapping from VehicleDTO to Vehicle not supported. Use VehicleRequest instead.");
    }

    @Override
    public List<VehicleDTO> toDtoList(List<Vehicle> entities) {
        return toVehicleDTOList(entities);
    }

    @Override
    public List<Vehicle> toEntityList(List<VehicleDTO> dtos) {
        // Not used directly in this implementation
        throw new UnsupportedOperationException("Direct mapping from VehicleDTO list to Vehicle list not supported. Use VehicleRequest instead.");
    }

    @Override
    public void updateEntity(VehicleDTO dto, Vehicle entity) {
        // Not used directly in this implementation
        throw new UnsupportedOperationException("Direct update from VehicleDTO not supported. Use VehicleRequest instead.");
    }

    @Override
    public Vehicle toEntity(VehicleRequest request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate(request.getVehicleNumber());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setRegistrationExpiryDate(request.getRegistrationExpiryDate());
        vehicle.setCurrentLatitude(request.getInitialLatitude());
        vehicle.setCurrentLongitude(request.getInitialLongitude());
        return vehicle;
    }

    @Override
    public void updateEntity(VehicleRequest request, Vehicle entity) {
        if (request.getVehicleNumber() != null) {
            entity.setLicensePlate(request.getVehicleNumber());
        }
        if (request.getMake() != null) {
            entity.setMake(request.getMake());
        }
        if (request.getModel() != null) {
            entity.setModel(request.getModel());
        }
        if (request.getYear() != null) {
            entity.setYear(request.getYear());
        }
        if (request.getCapacity() != null) {
            entity.setCapacity(request.getCapacity());
        }
        if (request.getInsuranceExpiryDate() != null) {
            entity.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        }
        if (request.getRegistrationExpiryDate() != null) {
            entity.setRegistrationExpiryDate(request.getRegistrationExpiryDate());
        }
    }

    @Override
    public VehicleDTO.DriverInfo driverToDriverInfo(Driver driver) {
        if (driver == null) {
            return null;
        }
        
        VehicleDTO.DriverInfo driverInfo = new VehicleDTO.DriverInfo();
        driverInfo.setId(driver.getId());
        driverInfo.setName(driver.getFirstName() + " " + driver.getLastName());
        driverInfo.setLicenseNumber(driver.getLicenseNumber());
        driverInfo.setPhoneNumber(driver.getPhoneNumber());
        
        return driverInfo;
    }

    /**
     * Converts a Vehicle entity to a VehicleDetailsDTO.
     * This method specifically handles the potential circular references.
     */
    public VehicleDetailsDTO toVehicleDetailsDTO(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }

        VehicleDetailsDTO dto = new VehicleDetailsDTO();
        
        // Map basic properties
        dto.setId(vehicle.getId());
        dto.setCreatedAt(vehicle.getCreatedAt());
        dto.setUpdatedAt(vehicle.getUpdatedAt());
        dto.setActive(vehicle.isActive());
        
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setCapacity(vehicle.getCapacity());
        dto.setInsuranceExpiryDate(vehicle.getInsuranceExpiryDate());
        dto.setRegistrationExpiryDate(vehicle.getRegistrationExpiryDate());
        dto.setLastMaintenanceDate(vehicle.getLastMaintenanceDate());
        dto.setCurrentMileage(vehicle.getCurrentMileage());
        dto.setStatus(vehicle.getStatus());
        dto.setCurrentLatitude(vehicle.getCurrentLatitude());
        dto.setCurrentLongitude(vehicle.getCurrentLongitude());
        
        // Set transient properties if they are populated
        dto.setCompletedTripsCount(vehicle.getCompletedTripsCount());
        dto.setTotalMileage(vehicle.getTotalMileage());
        dto.setActiveTripsCount(vehicle.getActiveTripsCount());
        
        // Map driver information if available
        if (vehicle.getDriver() != null) {
            VehicleDetailsDTO.DriverInfo driverInfo = new VehicleDetailsDTO.DriverInfo();
            driverInfo.setId(vehicle.getDriver().getId());
            driverInfo.setFullName(vehicle.getDriver().getFirstName() + " " + vehicle.getDriver().getLastName());
            driverInfo.setPhoneNumber(vehicle.getDriver().getPhoneNumber());
            driverInfo.setLicenseNumber(vehicle.getDriver().getLicenseNumber());
            dto.setDriver(driverInfo);
        }
        
        // Map school information if available
        if (vehicle.getSchool() != null) {
            VehicleDetailsDTO.SchoolInfo schoolInfo = new VehicleDetailsDTO.SchoolInfo();
            schoolInfo.setId(vehicle.getSchool().getId());
            schoolInfo.setName(vehicle.getSchool().getName());
            schoolInfo.setCity(vehicle.getSchool().getAddress());
            dto.setSchool(schoolInfo);
        }
        
        return dto;
    }
    
    /**
     * Converts a list of Vehicle entities to a list of VehicleDetailsDTO.
     */
    public List<VehicleDetailsDTO> toVehicleDetailsDTOList(List<Vehicle> vehicles) {
        return vehicles.stream()
                .map(this::toVehicleDetailsDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts a Vehicle entity to a VehicleDTO (for backward compatibility).
     */
    public VehicleDTO toVehicleDTO(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }
        
        VehicleDTO dto = new VehicleDTO();
        dto.setId(vehicle.getId());
        dto.setVehicleNumber(vehicle.getLicensePlate());
        dto.setModel(vehicle.getModel());
        dto.setCapacity(vehicle.getCapacity());
        dto.setActive(vehicle.isActive());
        dto.setCurrentLatitude(vehicle.getCurrentLatitude());
        dto.setCurrentLongitude(vehicle.getCurrentLongitude());
        
        // If there's a driver, map the driver info
        if (vehicle.getDriver() != null) {
            VehicleDTO.DriverInfo driverInfo = new VehicleDTO.DriverInfo();
            driverInfo.setId(vehicle.getDriver().getId());
            driverInfo.setName(vehicle.getDriver().getFirstName() + " " + vehicle.getDriver().getLastName());
            driverInfo.setLicenseNumber(vehicle.getDriver().getLicenseNumber());
            driverInfo.setPhoneNumber(vehicle.getDriver().getPhoneNumber());
            
            dto.setCurrentDrivers(List.of(driverInfo));
        }
        
        return dto;
    }
    
    /**
     * Converts a list of Vehicle entities to a list of VehicleDTOs.
     */
    public List<VehicleDTO> toVehicleDTOList(List<Vehicle> vehicles) {
        return vehicles.stream()
                .map(this::toVehicleDTO)
                .collect(Collectors.toList());
    }
} 