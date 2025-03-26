package com.example.backend.dto.vehicle;

import com.example.backend.dto.base.BaseDTO;
import com.example.backend.entities.Vehicle;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VehicleDTO extends BaseDTO {
    private String licensePlate;
    private String make;
    private String model;
    private Integer year;
    private Integer capacity;
    private LocalDate insuranceExpiryDate;
    private LocalDate registrationExpiryDate;
    private LocalDate lastMaintenanceDate;
    private Double currentMileage;
    private Long driverId;
    private String driverName;
    private Long schoolId;
    private String schoolName;
    private Double currentLatitude;
    private Double currentLongitude;
    private Vehicle.VehicleStatus status;
    private Long completedTripsCount;
    private Double totalMileage;
    private Long activeTripsCount;
} 