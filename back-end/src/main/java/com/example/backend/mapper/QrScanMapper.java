package com.example.backend.mapper;

import com.example.backend.dto.attendance.QrScanRequest;
import com.example.backend.entities.Attendance;
import com.example.backend.entities.Student;
import com.example.backend.entities.Trip;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface QrScanMapper {

    @Mapping(target = "student", source = "student")
    @Mapping(target = "trip", source = "trip")
    @Mapping(target = "status", constant = "PRESENT")
    @Mapping(target = "scanTime", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "parentNotified", constant = "false")
    @Mapping(target = "active", constant = "true")
    Attendance toAttendance(QrScanRequest request, Student student, Trip trip);

    @AfterMapping
    default void setNotes(@MappingTarget Attendance attendance, QrScanRequest request) {
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            attendance.setNotes(request.getNotes());
        } else {
            attendance.setNotes("Scanned at " + attendance.getScanTime());
        }
    }
} 