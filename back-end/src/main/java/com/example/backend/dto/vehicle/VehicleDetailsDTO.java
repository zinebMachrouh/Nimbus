package com.example.backend.dto.vehicle;

import com.example.backend.dto.base.BaseDTO;
import com.example.backend.entities.Vehicle.VehicleStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleDetailsDTO extends BaseDTO {
    private String licensePlate;
    private String make;
    private String model;
    private Integer year;
    private Integer capacity;
    private LocalDate insuranceExpiryDate;
    private LocalDate registrationExpiryDate;
    private LocalDate lastMaintenanceDate;
    private Double currentMileage;
    private VehicleStatus status;
    private Double currentLatitude;
    private Double currentLongitude;
    
    // Driver reference simplified to avoid circular dependencies
    private DriverInfo driver;
    
    // School reference simplified to avoid circular dependencies
    private SchoolInfo school;
    
    // Statistical information
    private Long completedTripsCount;
    private Double totalMileage;
    private Long activeTripsCount;
    
    @Getter
    @Setter
    @NoArgsConstructor
    public static class DriverInfo {
        private Long id;
        private String fullName;
        private String phoneNumber;
        private String licenseNumber;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    public static class SchoolInfo {
        private Long id;
        private String name;
        private String city;
    }
} 