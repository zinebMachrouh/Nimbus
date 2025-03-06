package com.nimbus.mapper;

import com.nimbus.dto.StudentDTO;
import com.nimbus.dto.request.UpdateStudentRequest;
import com.nimbus.model.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StudentMapper {
    
    private final UserMapper userMapper;
    private final RouteMapper routeMapper;
    
    public StudentDTO toDTO(Student student) {
        if (student == null) {
            return null;
        }
        
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFullName(student.getFullName());
        dto.setQrCode(student.getQrCode());
        dto.setParent_id(student.getParent().getId());
        dto.setRoute_id(student.getRoute().getId());
        dto.setSeatNumber(student.getSeatNumber());
        dto.setActive(student.isActive());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setUpdatedAt(student.getUpdatedAt());
        
        return dto;
    }
    
    public void updateStudentFromRequest(UpdateStudentRequest request, Student student) {
        if (request.getFullName() != null) {
            student.setFullName(request.getFullName());
        }
        
        if (request.getSeatNumber() != null) {
            student.setSeatNumber(request.getSeatNumber());
        }
        
        if (request.getActive() != null) {
            student.setActive(request.getActive());
        }
    }
}

