package com.example.backend.repository.base;

import com.example.backend.entities.base.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity> extends JpaRepository<T, Long>, JpaSpecificationExecutor<T> {
    List<T> findAllByActiveTrue();
    Optional<T> findByIdAndActiveTrue(Long id);
    
    @Modifying
    @Transactional
    @Query("UPDATE #{#entityName} e SET e.active = false WHERE e.id = :id")
    void softDelete(Long id);
} 