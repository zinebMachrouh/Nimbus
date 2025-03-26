package com.example.backend.dto.school;

import com.example.backend.dto.base.BaseDTO;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolDTO extends BaseDTO {
    private String name;
    private String address;
    private String phoneNumber;
    private Double latitude;
    private Double longitude;
    private Long activeStudentsCount;
    private Long activeRoutesCount;
    private Long activeDriversCount;
    private Long activeVehiclesCount;
} 