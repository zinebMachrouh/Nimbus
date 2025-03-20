package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateStudentRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Grade is required")
    private String grade;

    @NotBlank(message = "Class name is required")
    private String className;

    @NotNull(message = "School ID is required")
    private Long schoolId;

    @NotNull(message = "Parent ID is required")
    private Long parentId;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Seat number is required")
    private Integer seatNumber;

    private String pickupAddress;
    private String dropoffAddress;
    private String pickupTime;
    private String dropoffTime;
} 