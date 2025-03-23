package com.example.backend.mapper;

import com.example.backend.dto.vehicle.VehicleDetailsDTO;
import com.example.backend.entities.Vehicle;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper class for converting Vehicle entities to VehicleDetailsDTO objects.
 * This mapper is designed to prevent circular references during serialization.
 */
@Component
public class VehicleDetailsMapper {

    /**
     * Converts a Vehicle entity to a VehicleDetailsDTO.
     * This method specifically handles the potential circular references.
     */
    public VehicleDetailsDTO toDto(Vehicle vehicle) {
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
            // Combining first and last name for full name
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
            // Using the address as the city since School entity has an address field, not city
            schoolInfo.setCity(vehicle.getSchool().getAddress());
            dto.setSchool(schoolInfo);
        }
        
        return dto;
    }
    
    /**
     * Converts a list of Vehicle entities to a list of VehicleDetailsDTO.
     */
    public List<VehicleDetailsDTO> toDtoList(List<Vehicle> vehicles) {
        return vehicles.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
} 