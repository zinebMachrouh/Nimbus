package com.example.backend.mapper;

import com.example.backend.dto.route.RouteDTO;
import com.example.backend.dto.route.RouteRequest;
import com.example.backend.entities.Route;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RouteMapper extends BaseMapper<Route, RouteDTO> {
    
    @Override
    @Mapping(target = "schoolId", source = "school.id")
    @Mapping(target = "schoolName", source = "school.name")
    RouteDTO toDto(Route entity);

    @Mapping(target = "school", ignore = true)
    @Mapping(target = "trips", ignore = true)
    Route toEntity(RouteRequest request);

    @Mapping(target = "school", ignore = true)
    @Mapping(target = "trips", ignore = true)
    void updateEntity(RouteRequest request, @MappingTarget Route entity);

    RouteDTO.RouteStopDTO stopToDto(Route.RouteStop stop);
    Route.RouteStop stopToEntity(RouteRequest.RouteStopRequest request);
} 