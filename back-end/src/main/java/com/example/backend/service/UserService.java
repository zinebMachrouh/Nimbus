package com.example.backend.service;

import com.example.backend.entities.Student;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.service.base.BaseService;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
                       LocalDateTime licenseExpiryDate, Long schoolId, Long vehicleId, String username);

    Student createStudent(String firstName, String lastName, LocalDate dateOfBirth,
                         Long parentId, Long schoolId, Integer seatNumber);

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findByUsernameForAuthentication(String username);
    
    /**
     * Find all users by role
     */
    List<User> findByRole(User.Role role);
    
    /**
     * Find all parents
     */
    List<Parent> findAllParents();
    
    /**
     * Find all parents including inactive ones
     */
    List<Parent> findAllParentsIncludingInactive();
    
    /**
     * Save a parent entity
     * @param parent the parent to save
     * @return the saved parent
     */
    Parent save(Parent parent);
    
    /**
     * Update a parent's information
     */
    Parent updateParent(Long parentId, String firstName, String lastName, String email, 
                     String phoneNumber, String address, String emergencyContact, String emergencyPhone);
    
    /**
     * Updates a parent's emergency contact information
     * @param parentId the ID of the parent to update
     * @param emergencyContact the emergency contact name
     * @param emergencyPhone the emergency contact phone number
     * @return the updated parent
     */
    Parent updateParent(Long parentId, String emergencyContact, String emergencyPhone);
    
    /**
     * Delete a parent account
     */
    void deleteParent(Long parentId);
    
    /**
     * Toggle a parent's active status
     */
    Parent toggleParentStatus(Long parentId, boolean isActive);

    /**
     * Ensures that a parent's active status is properly set and not null
     * @param parent The parent entity to check
     * @return The parent with active status set properly
     */
    Parent ensureActiveStatus(Parent parent);
} 