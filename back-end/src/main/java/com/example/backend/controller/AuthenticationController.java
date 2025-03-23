package com.example.backend.controller;

import com.example.backend.dto.auth.AuthRequest;
import com.example.backend.dto.auth.JwtResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.entities.user.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

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
    public ResponseEntity<JwtResponse> authenticate(@RequestBody AuthRequest request) {
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
    
    // Debug endpoint to check user and password
    @PostMapping("/check-credentials")
    public ResponseEntity<Map<String, Object>> checkCredentials(@RequestBody AuthRequest request) {
        log.debug("AuthenticationController - Checking credentials for username: {}", request.getUsername());
        
        Map<String, Object> response = new HashMap<>();
        response.put("username", request.getUsername());
        response.put("passwordProvided", request.getPassword() != null);
        
        Optional<User> userOpt = userRepository.findByUsernameForAuthentication(request.getUsername().trim());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            response.put("userFound", true);
            response.put("userId", user.getId());
            response.put("userRole", user.getRole().name());
            response.put("userActive", user.isActive());
            
            // Check if password matches
            boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
            response.put("passwordMatches", passwordMatches);
            
            // Add stored password details (securely, truncated)
            String storedHash = user.getPassword();
            response.put("storedPasswordPrefix", storedHash.substring(0, Math.min(10, storedHash.length())) + "...");
            response.put("storedPasswordLength", storedHash.length());
            
        } else {
            response.put("userFound", false);
        }
        
        return ResponseEntity.ok(response);
    }

    // Utility endpoint to reset a user's password (admin only)
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestParam String username, 
            @RequestParam String newPassword) {
        log.debug("AuthenticationController - Attempting to reset password for user: {}", username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        
        try {
            Optional<User> userOpt = userRepository.findByUsernameIgnoreCaseForAuthentication(username.trim());
            
            if (userOpt.isEmpty()) {
                log.error("User not found for password reset: {}", username);
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }
            
            User user = userOpt.get();
            
            // Log original password hash (securely, truncated)
            String originalHash = user.getPassword();
            String originalPrefix = originalHash.substring(0, Math.min(10, originalHash.length())) + "...";
            log.debug("Original password hash prefix: {}, length: {}", originalPrefix, originalHash.length());
            
            // Encode the new password
            String encodedPassword = passwordEncoder.encode(newPassword);
            
            // Update the user's password
            user.setPassword(encodedPassword);
            userRepository.save(user);
            
            // Log new password hash (securely, truncated)
            String newHashPrefix = encodedPassword.substring(0, Math.min(10, encodedPassword.length())) + "...";
            log.debug("New password hash prefix: {}, length: {}", newHashPrefix, encodedPassword.length());
            
            response.put("success", true);
            response.put("userId", user.getId());
            response.put("message", "Password reset successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error resetting password for user: {}", username, e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 