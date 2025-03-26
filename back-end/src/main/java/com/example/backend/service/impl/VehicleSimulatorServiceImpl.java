package com.example.backend.service.impl;

import com.example.backend.dto.vehicle.VehicleLocationUpdateDTO;
import com.example.backend.service.VehicleService;
import com.example.backend.service.VehicleSimulatorService;
import com.example.backend.utils.contexts.VehicleSimulatorMovementContext;
import com.example.backend.utils.helpers.GeoHelper;
import com.example.backend.utils.records.Coordinates;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleSimulatorServiceImpl implements VehicleSimulatorService {
    private static final long MOVEMENT_INTERVAL_MS = 500;
    private static final long STOP_DELAY_MS = 1000;

    private final SimpMessagingTemplate messagingTemplate;
    private final VehicleService vehicleService;

    // Single executor for all vehicle movements to reduce thread overhead
    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(
            Runtime.getRuntime().availableProcessors(),
            r -> {
                Thread t = new Thread(r, "vehicle-movement-thread");
                t.setDaemon(true);
                return t;
            }
    );

    // Concurrent map to track active vehicle movements
    private final Map<Long, VehicleSimulatorMovementContext> activeMovements = new ConcurrentHashMap<>();

    /**
     * Start vehicle movement along a predefined route
     *
     * @param vehicleId ID of the vehicle to move
     * @param coordinates List of coordinates to follow
     * @param oldStops List of stop coordinates
     * @return boolean indicating if movement was successfully started
     */
    @Override
    public boolean startVehicleMovement(Long vehicleId, List<Coordinates> coordinates, List<Coordinates> oldStops) {
        // Validate input
        if (vehicleId == null || coordinates == null || coordinates.isEmpty()) {
            log.error("Invalid input: vehicleId or coordinates are null/empty");
            return false;
        }

        // Check if vehicle is already in movement
        stopVehicleMovementIfActive(vehicleId);

        // Generate interpolated route once
        List<Coordinates> interpolatedRoute = GeoHelper.generateInterpolatedRoute(coordinates);

        // Create a scheduled task for vehicle movement
        ScheduledFuture<?> task = executor.scheduleAtFixedRate(
                () -> processVehicleMovement(vehicleId),
                0,
                MOVEMENT_INTERVAL_MS,
                TimeUnit.MILLISECONDS
        );

        // Retrieve the coordinates closest to the old stops
        List<Coordinates> newStops = coordinates.stream()
                .min(Comparator.comparingDouble(c ->
                        oldStops.stream()
                                .mapToDouble(s -> GeoHelper.calculateDistance(c, s))
                                .min()
                                .orElse(Double.MAX_VALUE)
                ))
                .stream()
                .toList();

        // Store the movement context
        activeMovements.put(vehicleId, new VehicleSimulatorMovementContext(
                vehicleId,
                newStops,
                interpolatedRoute,
                task
        ));

        log.info("Started movement for vehicle {} with {} route points", vehicleId, interpolatedRoute.size());
        return true;
    }

    /**
     * Stop movement if vehicle is already active
     *
     * @param vehicleId ID of the vehicle
     */
    private void stopVehicleMovementIfActive(Long vehicleId) {
        if (activeMovements.containsKey(vehicleId)) {
            log.warn("Vehicle {} is already in movement. Stopping previous movement.", vehicleId);
            stopVehicleMovement(vehicleId);
        }
    }

    /**
     * Process movement for a specific vehicle
     *
     * @param vehicleId ID of the vehicle being moved
     */
    private void processVehicleMovement(Long vehicleId) {
        VehicleSimulatorMovementContext context = activeMovements.get(vehicleId);

        if (context == null) {
            return;
        }

        try {
            // Check if there are more steps in the route
            if (!context.hasMoreSteps()) {
                stopVehicleMovement(vehicleId);
                return;
            }

            // Get next coordinate and update vehicle location
            Coordinates nextCoordinate = context.getCurrentCoordinate();
            if (nextCoordinate == null) {
                stopVehicleMovement(vehicleId);
                return;
            }

            // Handle stop locations
            if (context.isStopLocation(nextCoordinate)) {
                handleStopLocation(vehicleId, nextCoordinate);
            }

            updateVehicleLocation(vehicleId, nextCoordinate);

        } catch (Exception e) {
            log.error("Error processing movement for vehicle {}: {}", vehicleId, e.getMessage(), e);
            stopVehicleMovement(vehicleId);
        }
    }

    /**
     * Handle vehicle arriving at a stop location
     *
     * @param vehicleId ID of the vehicle
     * @param stopCoordinate The stop coordinates
     */
    private void handleStopLocation(Long vehicleId, Coordinates stopCoordinate) {
        try {
            Thread.sleep(STOP_DELAY_MS);
            log.info("Vehicle {} arrived at stop {}", vehicleId, stopCoordinate);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Stop delay interrupted for vehicle {}", vehicleId);
        }
    }

    /**
     * Update vehicle location and broadcast
     *
     * @param vehicleId ID of the vehicle
     * @param coordinate New coordinates
     */
    private void updateVehicleLocation(Long vehicleId, Coordinates coordinate) {
        try {
            // Update vehicle location in database
            vehicleService.updateLocation(vehicleId, coordinate.lat(), coordinate.lng());

            // Broadcast location update via WebSocket
            messagingTemplate.convertAndSend(
                    "/topic/vehicle-locations",
                    new VehicleLocationUpdateDTO(vehicleId, coordinate)
            );
        } catch (Exception e) {
            log.error("Failed to update location for vehicle {}: {}", vehicleId, e.getMessage(), e);
        }
    }

    /**
     * Stop movement for a specific vehicle
     *
     * @param vehicleId ID of the vehicle to stop
     */
    @Override
    public void stopVehicleMovement(Long vehicleId) {
        VehicleSimulatorMovementContext context = activeMovements.remove(vehicleId);

        if (context != null) {
            context.stopMovement();
            log.info("Stopped movement for vehicle {}", vehicleId);
        }
    }

    /**
     * Clean up method to stop all active movements
     */
    @PreDestroy
    public void cleanup() {
        log.info("Shutting down vehicle simulator service, stopping all vehicle movements");
        activeMovements.keySet().forEach(this::stopVehicleMovement);
        executor.shutdownNow();
    }
}

