package com.example.backend.dto.response;

import com.example.backend.entities.School;
import lombok.Data;

@Data
public class SchoolResponseDTO {
    private Long id;
    private String name;
    private String address;
    private String phoneNumber;
    private Double latitude;
    private Double longitude;
    private Long activeStudentsCount;
    private Long activeRoutesCount;
    private Long activeDriversCount;
    private Long activeVehiclesCount;

    public static SchoolResponseDTO fromSchool(School school) {
        SchoolResponseDTO dto = new SchoolResponseDTO();
        dto.setId(school.getId());
        dto.setName(school.getName());
        dto.setAddress(school.getAddress());
        dto.setPhoneNumber(school.getPhoneNumber());
        dto.setLatitude(school.getLatitude());
        dto.setLongitude(school.getLongitude());
        dto.setActiveStudentsCount(school.getActiveStudentsCount());
        dto.setActiveRoutesCount(school.getActiveRoutesCount());
        dto.setActiveDriversCount(school.getActiveDriversCount());
        dto.setActiveVehiclesCount(school.getActiveVehiclesCount());
        return dto;
    }
} 