package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import com.example.backend.entities.user.Driver;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "vehicles")
public class Vehicle extends BaseEntity {
    
    @NotBlank(message = "License plate is required")
    @Column(nullable = false, unique = true)
    private String licensePlate;

    @NotBlank(message = "Make is required")
    @Column(nullable = false)
    private String make;

    @NotBlank(message = "Model is required")
    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private LocalDate insuranceExpiryDate;

    @Column(nullable = false)
    private LocalDate registrationExpiryDate;

    @Column(nullable = false)
    private LocalDate lastMaintenanceDate;

    @Column(nullable = false)
    private Double currentMileage;

    @OneToOne(mappedBy = "vehicle")
    private Driver driver;

    @ManyToOne
    @JoinColumn(name = "school_id")
    private School school;

    @OneToMany(mappedBy = "vehicle")
    private Set<Trip> trips = new HashSet<>();

    @Column
    private Double currentLatitude;

    @Column
    private Double currentLongitude;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Transient
    private Long completedTripsCount;

    @Transient
    private Double totalMileage;

    @Transient
    private Long activeTripsCount;

    public enum VehicleStatus {
        AVAILABLE,
        IN_USE,
        MAINTENANCE,
        OUT_OF_SERVICE
    }
} 