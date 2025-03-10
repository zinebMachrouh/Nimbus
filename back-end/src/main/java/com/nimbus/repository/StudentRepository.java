package com.nimbus.repository;

import com.nimbus.model.Parent;
import com.nimbus.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByParent(Parent parent);
    Optional<Student> findByQrCode(String qrCode);
}

