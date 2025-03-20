package com.example.backend.mapper;

import com.example.backend.dto.user.ParentDTO;
import com.example.backend.entities.Student;
import com.example.backend.entities.user.Parent;
import org.mapstruct.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {UserMapper.class})
public interface ParentMapper {
    
    @Mapping(target = "students", expression = "java(mapStudentSummaries(entity.getStudents()))")
    @Mapping(target = "recentNotifications", ignore = true) // Will be set by service layer
    ParentDTO toDto(Parent entity);

    @InheritConfiguration(name = "toDto")
    void updateEntity(ParentDTO dto, @MappingTarget Parent entity);

    @InheritInverseConfiguration(name = "toDto")
    @Mapping(target = "students", ignore = true)
    Parent toEntity(ParentDTO dto);

    default List<ParentDTO.StudentSummary> mapStudentSummaries(List<Student> students) {
        if (students == null) return null;
        return students.stream()
                .map(student -> {
                    ParentDTO.StudentSummary summary = new ParentDTO.StudentSummary();
                    summary.setStudentId(student.getId());
                    summary.setFullName(student.getFirstName() + " " + student.getLastName());
                    summary.setSchoolName(student.getSchool().getName());
                    summary.setSeatNumber(student.getSeatNumber());
                    // Current trip status will be set by service layer
                    summary.setCurrentTripStatus(ParentDTO.TripStatus.NOT_STARTED);
                    return summary;
                })
                .collect(Collectors.toList());
    }

    default ParentDTO.NotificationSummary createNotificationSummary(String studentName, String type, String message, String timestamp) {
        ParentDTO.NotificationSummary notification = new ParentDTO.NotificationSummary();
        notification.setStudentName(studentName);
        notification.setType(type);
        notification.setMessage(message);
        notification.setTimestamp(timestamp);
        notification.setRead(false);
        return notification;
    }
} 