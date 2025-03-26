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
    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "driverName", expression = "java(entity.getDriver() != null ? entity.getDriver().getFirstName() + \" \" + entity.getDriver().getLastName() : null)")
    @Mapping(target = "schoolId", source = "school.id")
    @Mapping(target = "schoolName", source = "school.name")
    VehicleDTO toDto(Vehicle entity);

    @Mapping(target = "driver", ignore = true)
    @Mapping(target = "school", ignore = true)
    @Mapping(target = "trips", ignore = true)
    @Mapping(target = "currentLatitude", source = "initialLatitude")
    @Mapping(target = "currentLongitude", source = "initialLongitude")
    @Mapping(target = "licensePlate", source = "vehicleNumber")
    Vehicle toEntity(VehicleRequest request);

    @Mapping(target = "driver", ignore = true)
    @Mapping(target = "school", ignore = true)
    @Mapping(target = "trips", ignore = true)
    @Mapping(target = "licensePlate", source = "vehicleNumber")
    void updateEntity(VehicleRequest request, @MappingTarget Vehicle entity);
}

@Component
class VehicleMapperImpl implements VehicleMapper {

    @Override
    public VehicleDTO toDto(Vehicle entity) {
        if (entity == null) {
            return null;
        }

        VehicleDTO dto = new VehicleDTO();
        dto.setId(entity.getId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setActive(entity.isActive());
        
        dto.setLicensePlate(entity.getLicensePlate());
        dto.setMake(entity.getMake());
        dto.setModel(entity.getModel());
        dto.setYear(entity.getYear());
        dto.setCapacity(entity.getCapacity());
        dto.setInsuranceExpiryDate(entity.getInsuranceExpiryDate());
        dto.setRegistrationExpiryDate(entity.getRegistrationExpiryDate());
        dto.setLastMaintenanceDate(entity.getLastMaintenanceDate());
        dto.setCurrentMileage(entity.getCurrentMileage());
        
        if (entity.getDriver() != null) {
            dto.setDriverId(entity.getDriver().getId());
            dto.setDriverName(entity.getDriver().getFirstName() + " " + entity.getDriver().getLastName());
        }
        
        if (entity.getSchool() != null) {
            dto.setSchoolId(entity.getSchool().getId());
            dto.setSchoolName(entity.getSchool().getName());
        }
        
        dto.setCurrentLatitude(entity.getCurrentLatitude());
        dto.setCurrentLongitude(entity.getCurrentLongitude());
        dto.setStatus(entity.getStatus());
        dto.setCompletedTripsCount(entity.getCompletedTripsCount());
        dto.setTotalMileage(entity.getTotalMileage());
        dto.setActiveTripsCount(entity.getActiveTripsCount());
        
        return dto;
    }

    @Override
    public Vehicle toEntity(VehicleDTO dto) {
        throw new UnsupportedOperationException("Direct mapping from VehicleDTO to Vehicle not supported. Use VehicleRequest instead.");
    }

    @Override
    public List<VehicleDTO> toDtoList(List<Vehicle> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<Vehicle> toEntityList(List<VehicleDTO> dtos) {
        throw new UnsupportedOperationException("Direct mapping from VehicleDTO list to Vehicle list not supported. Use VehicleRequest instead.");
    }

    @Override
    public void updateEntity(VehicleDTO dto, Vehicle entity) {
        throw new UnsupportedOperationException("Direct update from VehicleDTO not supported. Use VehicleRequest instead.");
    }

    @Override
    public Vehicle toEntity(VehicleRequest request) {
        if (request == null) {
            return null;
        }

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
        if (request == null) {
            return;
        }

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
} 