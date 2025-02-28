package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class SchoolRequest {
    @NotNull(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @NotNull(message = "Address is required")
    @Size(min = 3, max = 100, message = "Address must be between 3 and 100 characters")
    private String address;

    @NotNull(message = "Phone is required")
    private String phone;

    @NotNull(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Password is required")
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    private String password;

    @NotNull(message = "Principal is required")
    @Size(min = 3, max = 50, message = "Principal must be between 3 and 50 characters")
    private String principal;

    @NotNull(message = "GPS location is required")
    private String gps_location;

}
