package com.example.backend.repository;

import com.example.backend.entities.user.Parent;
import com.example.backend.repository.base.EmailAwareRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends EmailAwareRepository<Parent> {
    
    @Query("""
            SELECT p FROM Parent p 
            LEFT JOIN FETCH p.students s 
            WHERE p.id = :parentId AND p.active = true
            """)
    Optional<Parent> findByIdWithStudents(Long parentId);

    @Query("""
            SELECT p FROM Parent p 
            LEFT JOIN FETCH p.students s 
            WHERE s.school.id = :schoolId AND p.active = true
            """)
    List<Parent> findBySchoolId(Long schoolId);

    @Query("""
            SELECT COUNT(s) FROM Parent p 
            JOIN p.students s 
            WHERE p.id = :parentId AND s.active = true
            """)
    long countActiveStudents(Long parentId);

    @Query("""
            SELECT p FROM Parent p 
            LEFT JOIN FETCH p.students s 
            WHERE p.active = true 
            AND EXISTS (
                SELECT a FROM Attendance a 
                WHERE a.student IN (s) 
                AND a.parentNotified = false
            )
            """)
    List<Parent> findParentsWithUnnotifiedAttendance();

    @Query("""
            SELECT DISTINCT p FROM Parent p 
            JOIN p.students s 
            JOIN s.school sc 
            WHERE sc.id = :schoolId 
            AND p.active = true 
            AND s.active = true
            """)
    List<Parent> findActiveParentsBySchool(Long schoolId);

    @Query("""
            SELECT p FROM Parent p 
            LEFT JOIN FETCH p.students s 
            WHERE s.id = :studentId AND p.active = true
            """)
    Optional<Parent> findByStudentId(Long studentId);

    Optional<Parent> findByEmailAndActiveTrue(String email);
    
    @Query("SELECT p FROM Parent p WHERE p.email = :email AND p.active = true")
    Optional<Parent> findByEmailForAuthentication(String email);
    
    @Query("SELECT COUNT(p) FROM Parent p WHERE p.role = :role AND p.active = true")
    long countActiveUsersByRole(@Param("role") Parent.Role role);
    
    Optional<Parent> findByEmail(String email);
}