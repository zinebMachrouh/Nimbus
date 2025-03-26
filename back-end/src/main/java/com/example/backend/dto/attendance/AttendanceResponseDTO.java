package com.example.backend.dto.attendance;

import com.example.backend.entities.Attendance;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttendanceResponseDTO {
    private Long id;
    private StudentDTO student;
    private TripDTO trip;
    private String status;
    private LocalDateTime scanTime;
    private String notes;
    private Boolean parentNotified;
    private Integer seatNumber;
    private String qrCode;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class StudentDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String grade;
    }

    @Data
    public static class TripDTO {
        private Long id;
        private String name;
    }

    public static AttendanceResponseDTO fromEntity(Attendance attendance) {
        AttendanceResponseDTO dto = new AttendanceResponseDTO();
        dto.setId(attendance.getId());
        dto.setStatus(attendance.getStatus().name());
        dto.setScanTime(attendance.getScanTime());
        dto.setNotes(attendance.getNotes());
        dto.setParentNotified(attendance.getParentNotified());
        dto.setSeatNumber(attendance.getSeatNumber());
        dto.setQrCode(attendance.getQrCode());
        dto.setActive(attendance.isActive());
        dto.setCreatedAt(attendance.getCreatedAt());
        dto.setUpdatedAt(attendance.getUpdatedAt());

        if (attendance.getStudent() != null) {
            StudentDTO studentDTO = new StudentDTO();
            studentDTO.setId(attendance.getStudent().getId());
            studentDTO.setFirstName(attendance.getStudent().getFirstName());
            studentDTO.setLastName(attendance.getStudent().getLastName());
            studentDTO.setGrade(attendance.getStudent().getGrade());
            dto.setStudent(studentDTO);
        }

        if (attendance.getTrip() != null) {
            TripDTO tripDTO = new TripDTO();
            tripDTO.setId(attendance.getTrip().getId());
            dto.setTrip(tripDTO);
        }

        return dto;
    }
} 