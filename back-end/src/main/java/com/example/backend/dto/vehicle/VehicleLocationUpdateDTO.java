package com.example.backend.dto.vehicle;

import com.example.backend.utils.records.Coordinates;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * DTO for location update broadcast
 */
@RequiredArgsConstructor
@Getter
public class VehicleLocationUpdateDTO {
    private final Long vehicleId;
    private final Coordinates coordinates;
}