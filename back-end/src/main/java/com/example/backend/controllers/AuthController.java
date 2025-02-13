package com.example.backend.controllers;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.entities.Role;
import com.example.backend.entities.User;
import com.example.backend.repositories.RoleRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.utils.JwtUtil;
import com.example.backend.utils.TokenBlacklist;
import jakarta.servlet.http.HttpSession;
import lombok.*;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
@Profile("prod")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpSession httpSession) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getId());

        String token = jwtUtil.generateToken(user.getUsername(), claims);
        httpSession.setAttribute("token", token);

        return ResponseEntity.ok(new LoginResponse(token, user.getUsername(), user.getRole().toString(),true));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO registrationRequest) {
        if (userRepository.findByUsername(registrationRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        String requestedRole = registrationRequest.getRole();
        Optional<Role> validRole = roleRepository.findByName(requestedRole);


        User newUser = User.builder()
                .username(registrationRequest.getUsername())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .role(validRole.orElseThrow(() -> new RuntimeException("Role not found")))
                .build();

        User savedUser = userRepository.save(newUser);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", savedUser.getRole());
        claims.put("userId", savedUser.getId());
        String token = jwtUtil.generateToken(savedUser.getUsername(), claims);


        return ResponseEntity.ok(new LoginResponse(token, savedUser.getUsername(), savedUser.getRole().toString(), true));
    }



    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession httpSession) {
        httpSession.getAttribute("token");
        TokenBlacklist.add((String) httpSession.getAttribute("token"));

        System.out.println("Blacklist After Add: ");
        System.out.println(TokenBlacklist.getBlacklist());

        TokenBlacklist.clean();

        System.out.println("Blacklist After Clean: ");
        System.out.println(TokenBlacklist.getBlacklist());

        httpSession.invalidate();

        return ResponseEntity.ok("Logged out successfully");
    }
}