package com.nimbus.service;

import com.nimbus.dto.UserDTO;
import com.nimbus.dto.request.ChangePasswordRequest;
import com.nimbus.dto.request.UpdateUserRequest;

import java.util.List;

public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    UserDTO updateUser(Long id, UpdateUserRequest updateUserRequest);
    void changePassword(Long userId, ChangePasswordRequest changePasswordRequest);
    void activateUser(Long id);
    void deactivateUser(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}

