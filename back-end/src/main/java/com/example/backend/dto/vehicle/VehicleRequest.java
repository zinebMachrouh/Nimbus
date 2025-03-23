package com.example.backend.dto.vehicle;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VehicleRequest {
    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotNull(message = "Insurance expiry date is required")
    private LocalDate insuranceExpiryDate;

    @NotNull(message = "Registration expiry date is required")
    private LocalDate registrationExpiryDate;

    @NotNull(message = "Last maintenance date is required")
    private LocalDate lastMaintenanceDate;

    @NotNull(message = "Current mileage is required")
    @Min(value = 0, message = "Current mileage must be non-negative")
    private Double currentMileage;

    private String trackingDeviceId;
    private Double initialLatitude;
    private Double initialLongitude;
    
    // School ID to directly associate a vehicle with a school
    private Long schoolId;
} 