package com.example.backend.services;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.SchoolRequest;
import com.example.backend.dto.SchoolResponse;

public interface AuthService {
    SchoolResponse register(SchoolRequest schoolRequest);
    LoginResponse login(LoginRequest loginRequest);
    void logout();
}
