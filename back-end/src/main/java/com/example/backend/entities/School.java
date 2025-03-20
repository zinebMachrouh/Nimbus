package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import com.example.backend.entities.user.Admin;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "schools")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class School extends BaseEntity {
    
    @NotBlank(message = "School name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phoneNumber;

    @OneToMany(mappedBy = "school")
    @Builder.Default
    private Set<Student> students = new HashSet<>();

    @OneToMany(mappedBy = "school")
    @Builder.Default
    private Set<Route> routes = new HashSet<>();

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Transient
    @Builder.Default
    private Long activeStudentsCount = 0L;

    @Transient
    @Builder.Default
    private Long activeRoutesCount = 0L;

    @Transient
    @Builder.Default
    private Long activeDriversCount = 0L;

    @Transient
    @Builder.Default
    private Long activeVehiclesCount = 0L;

    @ManyToMany(mappedBy = "managedSchools")
    @Builder.Default
    @JsonIgnore
    private Set<Admin> admins = new HashSet<>();
} 