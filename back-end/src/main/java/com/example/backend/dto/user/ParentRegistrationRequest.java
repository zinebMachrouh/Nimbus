package com.example.backend.dto.user;

import com.example.backend.dto.auth.RegisterRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParentRegistrationRequest extends RegisterRequest {
    @NotBlank(message = "Address is required")
    private String address;

    public ParentRegistrationRequest() {
        setRole(com.example.backend.entities.user.User.Role.PARENT);
    }
} 