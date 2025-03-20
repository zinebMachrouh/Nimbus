package com.example.backend.service.base;

import com.example.backend.entities.base.BaseEntity;
import com.example.backend.repository.base.BaseRepository;
import com.example.backend.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Transactional(readOnly = true)
public abstract class BaseServiceImpl<T extends BaseEntity, R extends BaseRepository<T>> implements BaseService<T> {
    
    protected final R repository;

    protected BaseServiceImpl(R repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public T save(T entity) {
        log.debug("Saving entity of type {}", entity.getClass().getSimpleName());
        return repository.save(entity);
    }

    @Override
    @Transactional
    public List<T> saveAll(List<T> entities) {
        log.debug("Saving {} entities of type {}", entities.size(), entities.get(0).getClass().getSimpleName());
        return repository.saveAll(entities);
    }

    @Override
    public T findById(Long id) {
        log.debug("Finding entity by id: {}", id);
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entity not found with id: " + id));
    }

    @Override
    public List<T> findAll() {
        log.debug("Finding all entities");
        return repository.findAll();
    }

    @Override
    public Page<T> findAll(Pageable pageable) {
        log.debug("Finding all entities with pagination");
        return repository.findAll(pageable);
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    @Override
    public long count() {
        return repository.count();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.debug("Deleting entity with id: {}", id);
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {
        log.debug("Soft deleting entity with id: {}", id);
        T entity = findById(id);
        entity.setActive(false);
        repository.save(entity);
    }

    @Override
    public List<T> findAllActive() {
        log.debug("Finding all active entities");
        return repository.findAllByActiveTrue();
    }

    @Override
    public Optional<T> findByIdAndActiveTrue(Long id) {
        log.debug("Finding active entity by id: {}", id);
        return repository.findByIdAndActiveTrue(id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.debug("Deleting entity with id: {}", id);
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Entity not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public T createDriver(T entity) {
        throw new UnsupportedOperationException("Operation not supported for this entity type");
    }

    @Override
    @Transactional
    public void updateDriverProfile(Long id, T entity) {
        throw new UnsupportedOperationException("Operation not supported for this entity type");
    }
} 