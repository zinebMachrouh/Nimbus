package com.example.backend.utils.helpers;

import com.example.backend.utils.records.Coordinates;
import com.example.backend.utils.records.RouteStatistics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for interpolating geographic coordinates to create detailed routes
 * with intermediate points at specified distances.
 */
@Slf4j
public class GeoHelper {
    private static final double INTERPOLATION_DISTANCE = 5.0; // meters
    private static final double EARTH_RADIUS = 6371000.0; // meters

    /**
     * Calculates the distance between two coordinates using the Haversine formula
     *
     * @param c1 First coordinate
     * @param c2 Second coordinate
     * @return Distance in meters
     */
    public static double calculateDistance(Coordinates c1, Coordinates c2) {
        // Convert latitude and longitude to radians
        double phi1 = Math.toRadians(c1.lat());
        double phi2 = Math.toRadians(c1.lng());
        double deltaPhi = Math.toRadians(c2.lat() - c1.lat());
        double deltaLambda = Math.toRadians(c2.lng() - c1.lng());

        // Haversine formula
        double sinDeltaPhiHalf = Math.sin(deltaPhi / 2);
        double sinDeltaLambdaHalf = Math.sin(deltaLambda / 2);

        double a = sinDeltaPhiHalf * sinDeltaPhiHalf + Math.cos(phi1) * Math.cos(phi2) * sinDeltaLambdaHalf * sinDeltaLambdaHalf;

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    /**
     * Generates a detailed route with interpolated coordinates
     *
     * @param originalCoordinates List of original waypoints
     * @return List of coordinates with interpolation between points
     */
    public static List<Coordinates> generateInterpolatedRoute(List<Coordinates> originalCoordinates) {
        if (originalCoordinates == null || originalCoordinates.size() < 2) {
            log.warn("Cannot interpolate route with fewer than 2 coordinates");
            return new ArrayList<>(originalCoordinates != null ? originalCoordinates : List.of());
        }

        // Pre-allocate capacity to avoid resizing
        int estimatedSize = estimateRouteSize(originalCoordinates);
        List<Coordinates> detailedRoute = new ArrayList<>(estimatedSize);

        // Add the first point
        detailedRoute.add(originalCoordinates.get(0));

        // Process each segment
        for (int i = 0; i < originalCoordinates.size() - 1; i++) {
            Coordinates start = originalCoordinates.get(i);
            Coordinates end = originalCoordinates.get(i + 1);

            // Calculate distance between points
            double distance = calculateDistance(start, end);

            // Skip interpolation for very short segments
            if (distance < INTERPOLATION_DISTANCE) {
                if (i < originalCoordinates.size() - 2) {
                    continue;
                }
                detailedRoute.add(end);
                continue;
            }

            // Add interpolated points
            addInterpolatedPoints(detailedRoute, start, end, distance);

            // Add the end point of the segment (except for the last segment which is added outside the loop)
            if (i < originalCoordinates.size() - 2) {
                detailedRoute.add(end);
            }
        }

        // Add the final point
        detailedRoute.add(originalCoordinates.get(originalCoordinates.size() - 1));

        if (log.isDebugEnabled()) {
            log.debug("Generated interpolated route with {} points from {} original points", detailedRoute.size(), originalCoordinates.size());
        }

        return detailedRoute;
    }

    /**
     * Estimates the size of the final route to pre-allocate the ArrayList
     *
     * @param originalCoordinates The original waypoints
     * @return Estimated number of points in the final route
     */
    public static int estimateRouteSize(List<Coordinates> originalCoordinates) {
        int estimatedSize = originalCoordinates.size();

        // Quick estimation based on average segment length
        if (originalCoordinates.size() >= 2) {
            Coordinates first = originalCoordinates.get(0);
            Coordinates last = originalCoordinates.get(originalCoordinates.size() - 1);

            double totalDistance = calculateDistance(first, last);

            // Rough estimate: assume straight line and add 50% for safety
            estimatedSize += (int) (1.5 * totalDistance / INTERPOLATION_DISTANCE);
        }

        return estimatedSize;
    }

    /**
     * Adds interpolated points between two coordinates to the route
     *
     * @param route    The route to add points to
     * @param start    Starting coordinate
     * @param end      Ending coordinate
     * @param distance Distance between the points in meters
     */
    public static void addInterpolatedPoints(List<Coordinates> route, Coordinates start, Coordinates end, double distance) {
        // Number of points to interpolate
        int numPoints = Math.max(1, (int) Math.floor(distance / INTERPOLATION_DISTANCE));

        double startLat = start.lat();
        double startLng = start.lng();
        double endLat = end.lat();
        double endLng = end.lng();

        for (int i = 1; i <= numPoints; i++) {
            double fraction = (double) i / (numPoints + 1);

            // Linear interpolation of coordinates
            double interpolatedLat = startLat + fraction * (endLat - startLat);
            double interpolatedLng = startLng + fraction * (endLng - startLng);

            route.add(new Coordinates(interpolatedLat, interpolatedLng));
        }
    }

    /**
     * Calculates route statistics for analysis
     *
     * @param route List of coordinates in the route
     * @return RouteStatistics object with distance and point information
     */
    public static RouteStatistics calculateRouteStatistics(List<Coordinates> route) {
        if (route == null || route.size() < 2) {
            return new RouteStatistics(0, 0, 0);
        }

        double totalDistance = 0;
        double minSegmentDistance = Double.MAX_VALUE;
        double maxSegmentDistance = 0;

        for (int i = 1; i < route.size(); i++) {
            Coordinates point1 = route.get(i - 1);
            Coordinates point2 = route.get(i);

            double segmentDistance = calculateDistance(point1, point2);

            totalDistance += segmentDistance;
            minSegmentDistance = Math.min(minSegmentDistance, segmentDistance);
            maxSegmentDistance = Math.max(maxSegmentDistance, segmentDistance);
        }

        return new RouteStatistics(totalDistance, route.size(), totalDistance / Math.max(1, route.size() - 1));
    }

    public static Coordinates createCoordinates(double lat, double lng) {
        return new Coordinates(lat, lng);
    }

    public static Coordinates convertToCoordinates(List<Double> coordinate) {
        return new Coordinates(coordinate.get(1), coordinate.get(0));
    }
}

