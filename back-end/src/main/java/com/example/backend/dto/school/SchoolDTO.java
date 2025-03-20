package com.example.backend.dto.school;

import com.example.backend.dto.base.BaseDTO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SchoolDTO extends BaseDTO {
    private String name;
    private String address;
    private String phoneNumber;
    private Double latitude;
    private Double longitude;
    private Integer totalStudents;
    private Integer totalActiveRoutes;
} 