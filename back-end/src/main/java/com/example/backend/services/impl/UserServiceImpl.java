package com.example.backend.services.impl;

import com.example.backend.dto.UserDTO;
import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;


    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public List<UserDTO> findAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user ->
                        UserDTO.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(String.valueOf(user.getRole()))
                                .active(user.getActive())
                                .build())
                .toList();
    }
}