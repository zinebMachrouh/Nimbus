package com.example.backend.mapper;

import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.user.DriverRegistrationRequest;
import com.example.backend.dto.user.ParentRegistrationRequest;
import com.example.backend.entities.user.Admin;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RegistrationMapper {

    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "active", constant = "true")
    Admin toAdmin(RegisterRequest request);

    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "currentVehicle", ignore = true)
    @Mapping(target = "trips", ignore = true)
    Driver toDriver(DriverRegistrationRequest request);

    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "students", ignore = true)
    Parent toParent(ParentRegistrationRequest request);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "email", source = "email")
    @Mapping(target = "password", source = "password")
    void updateLoginCredentials(RegisterRequest request, @MappingTarget User user);
} 