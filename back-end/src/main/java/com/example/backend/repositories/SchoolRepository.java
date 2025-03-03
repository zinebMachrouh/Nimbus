package com.example.backend.repositories;

import com.example.backend.entities.School;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, String> {
    Boolean existsByNameAndEmail(String name, String email);
    Optional<School> findByEmail(String email);
}
