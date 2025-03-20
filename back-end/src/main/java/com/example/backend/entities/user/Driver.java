package com.example.backend.entities.user;

import com.example.backend.entities.School;
import com.example.backend.entities.Trip;
import com.example.backend.entities.Vehicle;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "drivers")
public class Driver extends User {
    
    @NotBlank(message = "License number is required")
    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    private LocalDateTime licenseExpiryDate;

    @OneToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "school_id")
    private School school;

    @OneToMany(mappedBy = "driver")
    private Set<Trip> trips = new HashSet<>();

    @Column
    private Double currentLatitude;

    @Column
    private Double currentLongitude;

    @Column(nullable = false)
    private DriverStatus status = DriverStatus.AVAILABLE;

    @Transient
    private Long completedTripsCount;

    @Transient
    private Double totalDistance;

    @Transient
    private Long activeTripsCount;

    public Driver() {
        setRole(Role.DRIVER);
    }

    public enum DriverStatus {
        AVAILABLE,
        ON_TRIP,
        OFF_DUTY,
        ON_LEAVE
    }
} 