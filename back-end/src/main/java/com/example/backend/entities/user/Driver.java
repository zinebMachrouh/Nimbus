package com.example.backend.entities.user;

import com.example.backend.entities.School;
import com.example.backend.entities.Trip;
import com.example.backend.entities.Vehicle;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @JsonManagedReference("driver-vehicle")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "school_id")
    @JsonBackReference("school-driver")
    private School school;

    @OneToMany(mappedBy = "driver")
    @JsonBackReference("driver-trip")
    private Set<Trip> trips = new HashSet<>();

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DriverStatus status = DriverStatus.AVAILABLE;

    @Column
    private Double currentLatitude;

    @Column
    private Double currentLongitude;

    @Column
    private LocalDateTime lastLocationUpdate;

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