package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import com.example.backend.entities.user.Parent;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "students")
public class Student extends BaseEntity {
    
    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    @JsonBackReference("parent-student")
    private Parent parent;

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    @JsonBackReference("school-student")
    private School school;

    @Column
    private String grade;

    @Column(unique = true)
    private String qrCode;

    @Column
    @Transient
    private Double attendancePercentage;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToMany(mappedBy = "students")
    @JsonBackReference("trips-students")
    private Set<Trip> trips = new HashSet<>();

    public void generateQRCode() {
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        this.qrCode = String.format("STUDENT-%s-%d-%d", 
            uniqueId,
            this.school != null ? this.school.getId() : 0,
            this.id != null ? this.id : 0
        );
    }
} 