package com.example.backend.dto.mapbox;

import java.util.List;

public record MapboxResponseDTO(List<Route> routes) {
    public record Route(double duration, double distance, Geometry geometry) {
        public record Geometry(List<List<Double>> coordinates) {}
    }
}