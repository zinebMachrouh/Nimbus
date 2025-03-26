package com.example.backend.dto.response;

import com.example.backend.entities.Vehicle;
import lombok.Data;

@Data
public class VehicleResponseDTO {
    private Long id;
    private String licensePlate;
    private String model;
    private Integer capacity;
    private String status;
    private Double currentLatitude;
    private Double currentLongitude;

    public static VehicleResponseDTO fromVehicle(Vehicle vehicle) {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(vehicle.getId());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setModel(vehicle.getModel());
        dto.setCapacity(vehicle.getCapacity());
        dto.setStatus(vehicle.getStatus().name());
        dto.setCurrentLatitude(vehicle.getCurrentLatitude());
        dto.setCurrentLongitude(vehicle.getCurrentLongitude());
        return dto;
    }
} 