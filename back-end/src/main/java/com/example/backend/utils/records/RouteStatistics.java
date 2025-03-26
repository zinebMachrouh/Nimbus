package com.example.backend.utils.records;

/**
 * Route statistics data class
 */
public record RouteStatistics(double totalDistanceMeters, int totalPoints, double averageSegmentDistanceMeters) {
    @Override
    public String toString() {
        return String.format("Route: %.2f meters, %d points, avg segment: %.2f meters", totalDistanceMeters, totalPoints, averageSegmentDistanceMeters);
    }
}