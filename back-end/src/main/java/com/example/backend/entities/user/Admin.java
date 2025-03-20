package com.example.backend.entities.user;

import com.example.backend.entities.School;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "admins")
public class Admin extends User {
    @ManyToMany
    @JoinTable(
        name = "admin_managed_schools",
        joinColumns = @JoinColumn(name = "admin_id"),
        inverseJoinColumns = @JoinColumn(name = "school_id")
    )
    @JsonIgnore
    private Set<School> managedSchools = new HashSet<>();

    @Transient
    private Long managedSchoolsCount;

    @Transient
    private Long managedUsersCount;

    @Transient
    private Long managedRoutesCount;

    public Admin() {
        setRole(Role.ADMIN);
    }
} 