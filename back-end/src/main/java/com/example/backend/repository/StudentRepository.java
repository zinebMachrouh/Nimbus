package com.example.backend.repository;

import com.example.backend.entities.Student;
import com.example.backend.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends BaseRepository<Student> {
    List<Student> findBySchoolIdAndActiveTrue(Long schoolId);
    List<Student> findByParentIdAndActiveTrue(Long parentId);
    
    @Query("SELECT s FROM Student s WHERE s.qrCode = :qrCode AND s.active = true")
    Optional<Student> findByQrCodeAndActiveTrue(String qrCode);
    
    @Query("SELECT s FROM Student s " +
           "LEFT JOIN FETCH s.parent " +
           "LEFT JOIN FETCH s.school " +
           "WHERE s.id = :id AND s.active = true")
    Optional<Student> findByIdWithDetails(Long id);
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.school.id = :schoolId AND s.active = true")
    long countBySchoolIdAndActiveTrue(Long schoolId);
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.parent.id = :parentId AND s.active = true")
    long countByParentIdAndActiveTrue(Long parentId);
    
    @Query("SELECT s FROM Student s WHERE " +
           "s.active = true AND " +
           "(LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Student> searchStudents(String query);

    @Query("SELECT s FROM Student s " +
           "WHERE s.school.id IN (SELECT r.school.id FROM Route r WHERE r.id = :routeId) " +
           "AND s.active = true")
    List<Student> findByRouteId(Long routeId);

    @Query("SELECT r.school.id FROM Route r WHERE r.id = :routeId")
    Optional<Long> findSchoolIdByRouteId(Long routeId);
} 