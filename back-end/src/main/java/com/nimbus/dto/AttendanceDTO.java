package com.nimbus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private TripDTO trip;
    private StudentDTO student;
    private boolean present;
    private Long boardingTime;
    private String boardingLocation;
    private boolean parentConfirmed;
    private String parentNote;
    private Long createdAt;
    private Long updatedAt;
}

