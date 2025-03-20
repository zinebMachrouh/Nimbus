package com.example.backend.repository.base;

import com.example.backend.entities.base.BaseEntity;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface EmailAwareRepository<T extends BaseEntity> extends BaseRepository<T> {
    boolean existsByEmail(String email);
} 