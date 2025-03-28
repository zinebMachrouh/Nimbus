package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import com.example.backend.entities.user.Driver;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "trips")
public class Trip extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    @JsonBackReference("route-trip")
    private Route route;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonBackReference("driver-trip")
    private Driver driver;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonBackReference("vehicle-trip")
    private Vehicle vehicle;

    @Column(nullable = false)
    private LocalDateTime scheduledDepartureTime;

    @Column
    private LocalDateTime actualDepartureTime;

    @Column
    private LocalDateTime actualArrivalTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status = TripStatus.SCHEDULED;

    @OneToMany(mappedBy = "trip")
    @JsonIgnore
    private Set<Attendance> attendances = new HashSet<>();

    @Column
    private String notes;

    public enum TripStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
} 