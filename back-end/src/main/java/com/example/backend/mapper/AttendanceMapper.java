package com.example.backend.mapper;

import com.example.backend.dto.attendance.AttendanceDTO;
import com.example.backend.dto.attendance.QrScanRequest;
import com.example.backend.entities.Attendance;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "trip", ignore = true)
    Attendance toEntity(AttendanceDTO dto);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "trip", ignore = true)
    @Mapping(target = "scanTime", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "parentNotified", constant = "false")
    Attendance toEntity(QrScanRequest request);

    @Override
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "trip", ignore = true)
    void updateEntity(AttendanceDTO dto, @MappingTarget Attendance entity);

    @Override
    default List<AttendanceDTO> toDtoList(List<Attendance> entities) {
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    default List<Attendance> toEntityList(List<AttendanceDTO> dtos) {
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
} 