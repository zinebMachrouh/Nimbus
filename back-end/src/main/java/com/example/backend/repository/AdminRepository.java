package com.example.backend.repository;

import com.example.backend.entities.user.Admin;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends UserRepository {
    
    @Query("SELECT a FROM Admin a WHERE a.active = true ORDER BY a.createdAt DESC")
    List<Admin> findAllActiveAdmins();

    @Query("""
            SELECT COUNT(DISTINCT s.id) 
            FROM Admin a 
            JOIN School s ON s.active = true 
            WHERE a.id = :adminId AND a.active = true
            """)
    long countManagedSchools(Long adminId);

    @Query("""
            SELECT COUNT(DISTINCT u.id) 
            FROM Admin a 
            JOIN User u ON u.active = true 
            WHERE a.id = :adminId AND a.active = true
            """)
    long countManagedUsers(Long adminId);

    @Query("""
            SELECT COUNT(DISTINCT r.id) 
            FROM Admin a 
            JOIN Route r ON r.active = true 
            WHERE a.id = :adminId AND a.active = true
            """)
    long countManagedRoutes(Long adminId);

    @Query("SELECT a FROM Admin a WHERE a.email = :email AND a.active = true")
    Optional<Admin> findAdminByEmailAndActiveTrue(String email);

    @Query("SELECT a FROM Admin a WHERE a.active = true ORDER BY a.createdAt DESC, a.id DESC LIMIT 1")
    Optional<Admin> findFirstByOrderByCreatedAtDesc();
} 