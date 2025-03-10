package com.nimbus.mapper;

import com.nimbus.dto.AttendanceDTO;
import com.nimbus.model.Attendance;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AttendanceMapper {
    
    private final TripMapper tripMapper;
    private final StudentMapper studentMapper;
    
    public AttendanceDTO toDTO(Attendance attendance) {
        if (attendance == null) {
            return null;
        }
        
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setTrip(tripMapper.toDTO(attendance.getTrip()));
        dto.setStudent(studentMapper.toDTO(attendance.getStudent()));
        dto.setPresent(attendance.isPresent());
        dto.setBoardingTime(attendance.getBoardingTime());
        dto.setBoardingLocation(attendance.getBoardingLocation());
        dto.setParentConfirmed(attendance.isParentConfirmed());
        dto.setParentNote(attendance.getParentNote());
        dto.setCreatedAt(attendance.getCreatedAt());
        dto.setUpdatedAt(attendance.getUpdatedAt());
        
        return dto;
    }
}

