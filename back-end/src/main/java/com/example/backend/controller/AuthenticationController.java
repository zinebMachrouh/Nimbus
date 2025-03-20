package com.example.backend.controller;

import com.example.backend.dto.auth.AuthRequest;
import com.example.backend.dto.auth.JwtResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        log.debug("AuthenticationController - Received registration request for username: {}", request.getUsername());
        try {
            JwtResponse response = authenticationService.register(request);
            log.debug("AuthenticationController - Successfully registered user with username: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("AuthenticationController - Failed to register user with username: {}", request.getUsername(), e);
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        log.debug("AuthenticationController - Received authentication request for username: {}", request.getUsername());
        log.debug("AuthenticationController - Received authentication request for password: {}", request.getPassword());
        try {
            log.debug("AuthenticationController - Login attempt with username: '{}' (length: {})",
                    request.getUsername(), request.getUsername().length());

            request.setUsername(request.getUsername().trim());

            JwtResponse response = authenticationService.authenticate(request);
            log.debug("AuthenticationController - Successfully authenticated user with username: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("AuthenticationController - Failed to authenticate user with username: {}", request.getUsername(), e);
            throw e;
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String refreshToken) {
        log.debug("AuthenticationController - Received logout request");
        try {
            if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
                refreshToken = refreshToken.substring(7);
            }
            authenticationService.logout(refreshToken);
            log.debug("AuthenticationController - Successfully logged out user");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("AuthenticationController - Failed to logout user", e);
            throw e;
        }
    }
} 