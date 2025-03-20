package com.example.backend.mapper;

import com.example.backend.dto.student.StudentDTO;
import com.example.backend.dto.student.StudentRequest;
import com.example.backend.entities.Student;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMapper extends BaseMapper<Student, StudentDTO> {
    
    @Override
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", expression = "java(entity.getParent() != null ? entity.getParent().getFirstName() + \" \" + entity.getParent().getLastName() : null)")
    @Mapping(target = "schoolId", source = "school.id")
    @Mapping(target = "schoolName", source = "school.name")
    @Mapping(target = "attendancePercentage", source = "attendancePercentage")
    StudentDTO toDto(Student entity);

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "school", ignore = true)
    @Mapping(target = "qrCode", ignore = true)
    @Mapping(target = "attendancePercentage", ignore = true)
    Student toEntity(StudentRequest request);

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "school", ignore = true)
    @Mapping(target = "qrCode", ignore = true)
    @Mapping(target = "attendancePercentage", ignore = true)
    void updateEntity(StudentRequest request, @MappingTarget Student entity);
} 