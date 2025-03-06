package com.nimbus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private String fullName;
    private String qrCode;
    private Long parent_id;
    private Long route_id;
    private Integer seatNumber;
    private String grade;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

