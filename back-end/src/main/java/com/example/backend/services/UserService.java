package com.example.backend.services;


import com.example.backend.entities.User;
import com.example.backend.dto.UserDTO;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> findByUsername(String username);
    List<UserDTO> findAllUsers();
}
