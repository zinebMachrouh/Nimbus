package com.example.backend.repository;

import com.example.backend.entities.Report;
import com.example.backend.entities.School;
import com.example.backend.entities.user.User;
import com.example.backend.entities.user.User.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // Find reports by sender
    List<Report> findBySenderOrderByCreatedAtDesc(User sender);
    
    // Find reports by school
    List<Report> findBySchoolOrderByCreatedAtDesc(School school);
    
    // Find reports by school and type
    List<Report> findBySchoolAndTypeOrderByCreatedAtDesc(School school, Report.ReportType type);
    
    // Find reports by sender role
    List<Report> findBySender_RoleOrderByCreatedAtDesc(Role role);
    
    // Find reports visible to a specific user
    @Query("""
            SELECT r FROM Report r
            WHERE r.school IN :schools
            OR (r.sender.role = 'ADMIN' AND :userRole = 'DRIVER')
            OR (r.sender.role = 'DRIVER' AND :userRole = 'ADMIN')
            ORDER BY r.createdAt DESC
            """)
    List<Report> findReportsVisibleToUser(@Param("schools") List<School> schools, @Param("userRole") String userRole);
    
    // Find reports by sender and school
    List<Report> findBySenderAndSchoolOrderByCreatedAtDesc(User sender, School school);
    
    // Find reports by status
    List<Report> findByStatusOrderByCreatedAtDesc(Report.ReportStatus status);
} 