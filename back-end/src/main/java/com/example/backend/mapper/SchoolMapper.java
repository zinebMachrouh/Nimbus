package com.example.backend.mapper;

import com.example.backend.dto.school.SchoolDTO;
import com.example.backend.dto.school.SchoolRequest;
import com.example.backend.entities.School;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SchoolMapper extends BaseMapper<School, SchoolDTO> {
    
    @Override
    @Mapping(target = "totalStudents", expression = "java(entity.getStudents() != null ? entity.getStudents().size() : 0)")
    @Mapping(target = "totalActiveRoutes", ignore = true) // This will be set by service layer
    SchoolDTO toDto(School entity);

    @Mapping(target = "students", ignore = true)
    School toEntity(SchoolRequest request);

    @Mapping(target = "students", ignore = true)
    void updateEntity(SchoolRequest request, @MappingTarget School entity);
} 