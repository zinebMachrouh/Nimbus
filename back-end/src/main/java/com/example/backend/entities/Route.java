package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "routes")
public class Route extends BaseEntity {
    
    @NotBlank(message = "Route name is required")
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @OneToMany(mappedBy = "route")
    private Set<Trip> trips = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RouteType type;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RouteStatus status = RouteStatus.ACTIVE;

    @ElementCollection
    @CollectionTable(name = "route_stops", joinColumns = @JoinColumn(name = "route_id"))
    @OrderColumn(name = "stop_order")
    private List<RouteStop> stops = new ArrayList<>();

    @Transient
    private Long activeStudentsCount;

    @Transient
    private Long completedTripsCount;

    @Transient
    private Double totalDistance;

    @Transient
    private Integer estimatedDuration;

    public enum RouteType {
        MORNING_PICKUP,
        AFTERNOON_DROPOFF
    }

    public enum RouteStatus {
        ACTIVE,
        INACTIVE,
        MAINTENANCE,
        CANCELLED
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteStop {
        private String name;
        private String address;
        private Double latitude;
        private Double longitude;
        private Integer estimatedMinutesFromStart;
    }
} 