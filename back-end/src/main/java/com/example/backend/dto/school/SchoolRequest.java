package com.example.backend.dto.school;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SchoolRequest {
    @NotBlank(message = "School name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Invalid phone number format")
    private String phoneNumber;

    private Double latitude;
    private Double longitude;
} 