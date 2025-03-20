package com.example.backend.mapper;

import com.example.backend.dto.user.AdminDTO;
import com.example.backend.entities.user.Admin;
import org.mapstruct.*;

@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {UserMapper.class})
public interface AdminMapper {
    
    @Mapping(target = "totalManagedSchools", ignore = true) // Will be set by service layer
    @Mapping(target = "totalActiveUsers", ignore = true) // Will be set by service layer
    @Mapping(target = "totalActiveRoutes", ignore = true) // Will be set by service layer
    AdminDTO toDto(Admin entity);

    @InheritConfiguration(name = "toDto")
    void updateEntity(AdminDTO dto, @MappingTarget Admin entity);

    @InheritInverseConfiguration(name = "toDto")
    Admin toEntity(AdminDTO dto);
} 