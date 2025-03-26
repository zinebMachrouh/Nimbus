package com.example.backend.dto.auth;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private Long schoolId;

    public JwtResponse(String accessToken, Long id, String username, String email, String firstName, String phoneNumber, String lastName, String role, Long schoolId) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.phoneNumber = phoneNumber;
        this.lastName = lastName;
        this.role = role;
        this.schoolId = schoolId;
    }
}

