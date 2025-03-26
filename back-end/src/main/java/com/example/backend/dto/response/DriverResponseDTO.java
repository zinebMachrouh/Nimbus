package com.example.backend.dto.response;

import com.example.backend.entities.user.Driver;
import lombok.Data;

@Data
public class DriverResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String licenseNumber;
    private String licenseExpiryDate;
    private String status;
    private Double currentLatitude;
    private Double currentLongitude;
    private Long completedTripsCount;
    private Double totalDistance;
    private Long activeTripsCount;
    private SchoolResponseDTO school;
    private VehicleResponseDTO vehicle;

    public static DriverResponseDTO fromDriver(Driver driver) {
        DriverResponseDTO dto = new DriverResponseDTO();
        dto.setId(driver.getId());
        dto.setFirstName(driver.getFirstName());
        dto.setLastName(driver.getLastName());
        dto.setEmail(driver.getEmail());
        dto.setPhoneNumber(driver.getPhoneNumber());
        dto.setLicenseNumber(driver.getLicenseNumber());
        dto.setLicenseExpiryDate(driver.getLicenseExpiryDate().toString());
        dto.setStatus(driver.getStatus().name());
        dto.setCurrentLatitude(driver.getCurrentLatitude());
        dto.setCurrentLongitude(driver.getCurrentLongitude());
        dto.setCompletedTripsCount(driver.getCompletedTripsCount());
        dto.setTotalDistance(driver.getTotalDistance());
        dto.setActiveTripsCount(driver.getActiveTripsCount());
        
        if (driver.getSchool() != null) {
            dto.setSchool(SchoolResponseDTO.fromSchool(driver.getSchool()));
        }
        
        if (driver.getVehicle() != null) {
            dto.setVehicle(VehicleResponseDTO.fromVehicle(driver.getVehicle()));
        }
        
        return dto;
    }
} 