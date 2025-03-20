package com.example.backend.service;

import com.example.backend.entities.Student;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.service.base.BaseService;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface UserService extends BaseService<User>, UserDetailsService {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailForAuthentication(String email);
    long countActiveUsersByRole(User.Role role);
    void activateUser(Long userId);
    void deactivateUser(Long userId);
    void updatePassword(Long userId, String newPassword);
    boolean validatePassword(String rawPassword, String encodedPassword);
    void changePassword(Long userId, String oldPassword, String newPassword);
    void resetPassword(Long userId, String newPassword);
    void updateProfile(Long userId, User updatedUser);
    Parent createParent(String firstName, String lastName, String email, 
                       String password, String phoneNumber, String address);

    Driver createDriver(String firstName, String lastName, String email, 
                       String password, String phoneNumber, String licenseNumber,
                       LocalDateTime licenseExpiryDate, Long schoolId, Long vehicleId);

    Student createStudent(String firstName, String lastName, LocalDate dateOfBirth,
                         String studentId, Long parentId, Long schoolId, Integer seatNumber);

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findByUsernameForAuthentication(String username);
} 