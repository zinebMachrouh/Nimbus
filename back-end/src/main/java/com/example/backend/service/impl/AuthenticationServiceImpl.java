package com.example.backend.service.impl;

import com.example.backend.dto.auth.AuthRequest;
import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.JwtResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.entities.School;
import com.example.backend.entities.user.User;
import com.example.backend.entities.user.User.Role;
import com.example.backend.entities.user.Admin;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.exception.ValidationException;
import com.example.backend.security.jwt.JwtUtils;
import com.example.backend.security.services.UserDetailsImpl;
import com.example.backend.service.AuthenticationService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserService userService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @Override
    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userService.existsByUsername(request.getUsername())) {
            throw new ValidationException("username", "Username already exists");
        }

        User user = new Admin();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail().trim());
        user.setPassword(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.ADMIN);
        user.setActive(true);

        user = userService.save(user);

        // Create UserDetailsImpl for authentication
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String accessToken = jwtUtils.generateJwtToken(authentication);

        // Get school ID based on user type
        Long schoolId = null;
        if (user instanceof Driver) {
            schoolId = ((Driver) user).getSchool() != null ? ((Driver) user).getSchool().getId() : null;
        } else if (user instanceof Admin) {
            // For admin, get the first managed school's ID if any exist
            schoolId = ((Admin) user).getManagedSchools().stream()
                .findFirst()
                .map(School::getId)
                .orElse(null);
        } else if (user instanceof Parent) {
            // For parent, get the school ID from their first student if any exist
            schoolId = ((Parent) user).getStudents().stream()
                .findFirst()
                .map(student -> student.getSchool() != null ? student.getSchool().getId() : null)
                .orElse(null);
        }

        return new JwtResponse(accessToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getPhoneNumber(),
                user.getLastName(),
                "ROLE_" + user.getRole().name(),
                schoolId);
    }

    @Override
    public JwtResponse authenticate(AuthRequest loginRequest) {
        log.debug("Attempting to authenticate user: {}", loginRequest.getUsername());
        
        try {
            // Ensure username is trimmed
            loginRequest.setUsername(loginRequest.getUsername().trim());
            
            log.debug("Creating UsernamePasswordAuthenticationToken for user: {}", loginRequest.getUsername());
            
            // Attempt to find the user directly first to check if they exist
            Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());
            
            if (userOpt.isEmpty()) {
                log.error("User not found for authentication check: {}", loginRequest.getUsername());
                throw new ValidationException("Invalid username or password");
            }
            
            User user = userOpt.get();
            if (!user.isActive()) {
                log.error("Attempt to authenticate inactive user: {}", loginRequest.getUsername());
                throw new ValidationException("User account is not active");
            }
            
            // Check password match before trying authentication manager
            boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
            log.debug("Pre-check: Password matches for user {}: {}", loginRequest.getUsername(), passwordMatches);
            
            if (!passwordMatches) {
                log.error("Password mismatch for user: {}", loginRequest.getUsername());
                throw new ValidationException("Invalid username or password");
            }
            
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword());
            
            log.debug("Attempting authentication with AuthenticationManager");
            Authentication authentication = authenticationManager.authenticate(authToken);
            log.debug("Authentication successful, setting SecurityContext");
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            log.debug("Retrieved UserDetailsImpl for user: {}", userDetails.getUsername());
            
            String jwt = jwtUtils.generateJwtToken(authentication);
            log.debug("Generated JWT token successfully");

            // Get school ID based on user type
            Long schoolId = null;
            if (user instanceof Driver) {
                schoolId = ((Driver) user).getSchool() != null ? ((Driver) user).getSchool().getId() : null;
            } else if (user instanceof Admin) {
                // For admin, get the first managed school's ID if any exist
                schoolId = ((Admin) user).getManagedSchools().stream()
                    .findFirst()
                    .map(School::getId)
                    .orElse(null);
            } else if (user instanceof Parent) {
                // For parent, get the school ID from their first student if any exist
                schoolId = ((Parent) user).getStudents().stream()
                    .findFirst()
                    .map(student -> student.getSchool() != null ? student.getSchool().getId() : null)
                    .orElse(null);
            }
            
            return new JwtResponse(jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getPhoneNumber(),
                    user.getLastName(),
                    "ROLE_" + user.getRole().name(),
                    schoolId);
        } catch (Exception e) {
            log.error("Authentication failed for user: {} - Exception: {} - Stack trace: {}", 
                loginRequest.getUsername(), e.getMessage(), e.getStackTrace());
            if (e instanceof BadCredentialsException) {
                log.error("Bad credentials for user: {}", loginRequest.getUsername());
            } else if (e instanceof UsernameNotFoundException) {
                log.error("Username not found: {}", loginRequest.getUsername());
            }
            throw new ValidationException("Invalid username or password");
        }
    }

    @Override
    public void logout(String refreshToken) {
        final String username = jwtUtils.getUserNameFromJwtToken(refreshToken);

        if (username == null) {
            throw new ValidationException("Invalid refresh token");
        }

        User user = userService.findByUsername(username)
                .orElseThrow(() -> new ValidationException("User not found"));

        if (!jwtUtils.isTokenValid(refreshToken)) {
            throw new ValidationException("Invalid refresh token");
        }
    }
}