package com.example.backend.dto.attendance;

import com.example.backend.entities.Attendance;
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

    @NotNull(message = "Attendance status is required")
    private Attendance.AttendanceStatus status;

    private String notes;
} 