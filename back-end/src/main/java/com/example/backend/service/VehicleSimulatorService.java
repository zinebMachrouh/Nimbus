package com.example.backend.service;

import com.example.backend.utils.records.Coordinates;

import java.util.List;

public interface VehicleSimulatorService {
    boolean startVehicleMovement(Long vehicleId, List<Coordinates> coordinates, List<Coordinates> oldStops);
    void stopVehicleMovement(Long vehicleId);
}
