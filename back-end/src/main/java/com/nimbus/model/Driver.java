package com.nimbus.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "drivers")
public class Driver extends User {
    @Column(unique = true)
    private String licenseNumber;

    @OneToMany(mappedBy = "driver")
    private Set<Trip> assignedTrips = new HashSet<>();
}

