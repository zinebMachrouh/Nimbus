package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import com.example.backend.entities.user.Parent;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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
    private Integer seatNumber;

    @Column
    private String grade;

    private String qrCode;

    @Transient
    private Double attendancePercentage;

    /**
     * QR code will be generated after a route is assigned to the student
     * This is called programmatically, not via PrePersist
     */
    public void generateQRCode() {
        if (this.getId() != null) {
            // Generate QR code based on student ID
            this.qrCode = String.format("NIMBUS-STD-%d", this.getId());
        }
    }
} 