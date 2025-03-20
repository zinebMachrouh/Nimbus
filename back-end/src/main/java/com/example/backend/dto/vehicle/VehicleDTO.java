package com.example.backend.dto.vehicle;

import com.example.backend.dto.base.BaseDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class VehicleDTO extends BaseDTO {
    private String vehicleNumber;
    private String model;
    private Integer capacity;
    private List<DriverInfo> currentDrivers;
    private boolean active;
    private Double currentLatitude;
    private Double currentLongitude;
    private Double currentSpeed;
    private String trackingDeviceId;
    private String currentTripInfo;

    @Getter
    @Setter
    public static class DriverInfo {
        private Long id;
        private String name;
        private String licenseNumber;
        private String phoneNumber;
    }
} 