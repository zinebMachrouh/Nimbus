package com.example.backend.services.impl;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.SchoolRequest;
import com.example.backend.dto.SchoolResponse;
import com.example.backend.entities.School;
import com.example.backend.entities.User;
import com.example.backend.enums.Role;
import com.example.backend.repositories.SchoolRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.AuthService;
import com.example.backend.utils.JwtUtil;
import com.example.backend.utils.TokenBlacklist;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Override
    public SchoolResponse register(SchoolRequest schoolRequest) {
        if (schoolRepository.existsByNameAndEmail(schoolRequest.getName(),schoolRequest.getEmail())) {
            throw new RuntimeException("School already exists");
        }

        School newSchool = buildSchool(schoolRequest);

        School school = schoolRepository.save(newSchool);

        User newUser = buildUser(school, schoolRequest);

        User user = userRepository.save(newUser);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getId());

        String token = jwtUtil.generateToken(user.getUsername(), claims);


        return buildSchoolResponse(school, token);
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getId());

        String token = jwtUtil.generateToken(user.getUsername(), claims);

        School school = schoolRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("School not found"));

        return buildSchoolResponse(school, token);
    }

    @Override
    public void logout() {
        TokenBlacklist.clean();
    }

    private SchoolResponse buildSchoolResponse(School school, String token) {
        return SchoolResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .address(school.getAddress())
                .phone(school.getPhone())
                .email(school.getEmail())
                .principal(school.getPrincipal())
                .gps_location(school.getGps_location())
                .status(school.getStatus().toString())
                .token(token)
                .build();
    }

    private School buildSchool(SchoolRequest schoolRequest) {
        return School.builder()
                .name(schoolRequest.getName())
                .address(schoolRequest.getAddress())
                .phone(schoolRequest.getPhone())
                .email(schoolRequest.getEmail())
                .password(passwordEncoder.encode(schoolRequest.getPassword()))
                .principal(schoolRequest.getPrincipal())
                .gps_location(schoolRequest.getGps_location())
                .build();
    }

    private User buildUser(School school, SchoolRequest schoolRequest) {
        return User.builder()
                .name(schoolRequest.getName())
                .email(schoolRequest.getEmail())
                .password(passwordEncoder.encode(schoolRequest.getPassword()))
                .role(Role.SCHOOL)
                .school(school)
                .build();
    }
}


