package com.example.backend.mapper;

import com.example.backend.dto.user.UserDTO;
import com.example.backend.entities.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper extends BaseMapper<User, UserDTO> {
    @Override
    @Mapping(target = "password", ignore = true)
    UserDTO toDto(User entity);

    @Override
    @Mapping(target = "password", ignore = true)
    void updateEntity(UserDTO dto, @MappingTarget User entity);
} 