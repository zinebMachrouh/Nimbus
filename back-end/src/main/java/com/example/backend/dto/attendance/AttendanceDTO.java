package com.example.backend.dto.attendance;

import com.example.backend.dto.base.BaseDTO;
import com.example.backend.entities.Attendance;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AttendanceDTO extends BaseDTO {
    private Long studentId;
    private String studentName;
    private Integer seatNumber;
    private Long tripId;
    private String tripName;
    private LocalDateTime scheduledDepartureTime;
    private Attendance.AttendanceStatus status;
    private LocalDateTime scanTime;
    private String notes;
    private Boolean parentNotified;
} 