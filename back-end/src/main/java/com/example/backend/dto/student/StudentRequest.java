package com.example.backend.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudentRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotNull(message = "Parent ID is required")
    private Long parentId;

    @NotNull(message = "School ID is required")
    private Long schoolId;

    @NotNull(message = "Seat number is required")
    private Integer seatNumber;
} 