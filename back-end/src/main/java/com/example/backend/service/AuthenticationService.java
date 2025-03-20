package com.example.backend.service;

import com.example.backend.dto.auth.AuthRequest;
import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.JwtResponse;
import com.example.backend.dto.auth.RegisterRequest;
import org.springframework.http.ResponseEntity;

public interface AuthenticationService {
    JwtResponse register(RegisterRequest request);
    JwtResponse authenticate(AuthRequest request);
    void logout(String refreshToken);
} 