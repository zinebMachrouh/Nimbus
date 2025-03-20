package com.example.backend.dto.user;

import com.example.backend.dto.auth.RegisterRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DriverRegistrationRequest extends RegisterRequest {
    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private Long initialVehicleId;

    public DriverRegistrationRequest() {
        setRole(com.example.backend.entities.user.User.Role.DRIVER);
    }
} 