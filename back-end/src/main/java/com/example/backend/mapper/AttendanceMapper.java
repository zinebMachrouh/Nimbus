package com.example.backend.mapper;

import com.example.backend.dto.attendance.AttendanceDTO;
import com.example.backend.dto.attendance.QrScanRequest;
import com.example.backend.entities.Attendance;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AttendanceMapper extends BaseMapper<Attendance, AttendanceDTO> {
    
    @Override
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", expression = "java(entity.getStudent() != null ? entity.getStudent().getFirstName() + \" \" + entity.getStudent().getLastName() : null)")
    @Mapping(target = "seatNumber", source = "student.seatNumber")
    @Mapping(target = "tripId", source = "trip.id")
    @Mapping(target = "tripName", expression = "java(entity.getTrip() != null ? entity.getTrip().getRoute().getName() : null)")
    @Mapping(target = "scheduledDepartureTime", source = "trip.scheduledDepartureTime")
    AttendanceDTO toDto(Attendance entity);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "trip", ignore = true)
    @Mapping(target = "scanTime", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "parentNotified", constant = "false")
    Attendance toEntity(QrScanRequest request);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "trip", ignore = true)
    void updateEntity(AttendanceDTO dto, @MappingTarget Attendance entity);
} 