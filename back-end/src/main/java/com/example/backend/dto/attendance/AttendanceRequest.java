package com.example.backend.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotBlank(message = "Status is required")
    private String status;

    private String notes;
} 