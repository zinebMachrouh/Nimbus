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

    @Column(nullable = false, unique = true)
    private String studentId;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    @JsonBackReference("parent-student")
    private Parent parent;

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    @JsonBackReference("school-student")
    private School school;

    @Column(nullable = false)
    private Integer seatNumber;

    @Column
    private String grade;

    private String qrCode;

    @Transient
    private Double attendancePercentage;

    @PrePersist
    private void generateQRCode() {
        if (qrCode == null) {
            // Generate QR code based on student ID and other information
            this.qrCode = String.format("NIMBUS-STD-%s-%d", studentId, seatNumber);
        }
    }
} 