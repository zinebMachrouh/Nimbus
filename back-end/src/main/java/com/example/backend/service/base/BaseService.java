package com.example.backend.service.base;

import com.example.backend.entities.base.BaseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface BaseService<T extends BaseEntity> {
    T save(T entity);
    List<T> saveAll(List<T> entities);
    T findById(Long id);
    List<T> findAll();
    Page<T> findAll(Pageable pageable);
    boolean existsById(Long id);
    long count();
    void deleteById(Long id);
    void softDeleteById(Long id);
    List<T> findAllActive();
    Optional<T> findByIdAndActiveTrue(Long id);
    void delete(Long id);
    T createDriver(T entity);
    void updateDriverProfile(Long id, T entity);
} 