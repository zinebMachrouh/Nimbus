package com.example.backend.service;

import com.example.backend.dto.mapbox.MapboxResponseDTO;
import com.example.backend.utils.records.Coordinates;

import java.util.List;

public interface MapboxService {
    public MapboxResponseDTO getDirections(List<Coordinates> coordinates);
}
