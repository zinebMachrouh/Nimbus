package com.example.backend.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Data
@SuperBuilder
public class SchoolResponse extends LoginResponse{
    private String address;
    private String phone;
    private String principal;
    private String gps_location;
    private String status;
}
