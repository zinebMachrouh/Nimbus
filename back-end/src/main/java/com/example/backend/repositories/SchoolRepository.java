package com.example.backend.repositories;

import com.example.backend.entities.School;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SchoolRepository extends MongoRepository<School, String> {
    Boolean existsByNameAndEmail(String name, String email);
    Optional<School> findByEmail(String email);
}
