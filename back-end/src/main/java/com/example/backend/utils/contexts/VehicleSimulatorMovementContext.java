package com.example.backend.utils.contexts;

import com.example.backend.utils.records.Coordinates;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Represents the current movement context for a vehicle
 */
@RequiredArgsConstructor
@Getter
public class VehicleSimulatorMovementContext {
    private final Long vehicleId;
    private final List<Coordinates> stops;
    private final List<Coordinates> route;
    private final AtomicInteger currentStep = new AtomicInteger(0);
    private final ScheduledFuture<?> scheduledTask;

    public boolean hasMoreSteps() {
        return currentStep.get() < route.size();
    }

    public Coordinates getCurrentCoordinate() {
        int step = currentStep.getAndIncrement();
        return step < route.size() ? route.get(step) : null;
    }

    public boolean isStopLocation(Coordinates coordinate) {
        return stops.contains(coordinate);
    }

    public void stopMovement() {
        if (scheduledTask != null && !scheduledTask.isDone()) {
            scheduledTask.cancel(false);
        }
    }
}