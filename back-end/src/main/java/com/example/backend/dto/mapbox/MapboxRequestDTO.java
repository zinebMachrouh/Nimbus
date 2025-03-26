package com.example.backend.dto.mapbox;

import com.example.backend.utils.records.Coordinates;

import java.util.List;

public record MapboxRequestDTO(List<Coordinates> coordinates) {
}
