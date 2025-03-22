package com.example.backend.repository;

import com.example.backend.entities.user.User;
import com.example.backend.repository.base.EmailAwareRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends EmailAwareRepository<User> {
    Optional<User> findByEmailAndActiveTrue(String email);
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findByEmailForAuthentication(String email);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.active = true")
    long countActiveUsersByRole(User.Role role);

    Optional<User> findByUsernameAndActiveTrue(String username);
    
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.active = true")
    Optional<User> findByUsernameForAuthentication(@Param("username") String username);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username) AND u.active = true")
    Optional<User> findByUsernameIgnoreCaseForAuthentication(@Param("username") String username);
    
    boolean existsByUsername(String username);
} 