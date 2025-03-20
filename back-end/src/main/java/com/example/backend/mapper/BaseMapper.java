package com.example.backend.mapper;

import com.example.backend.dto.base.BaseDTO;
import com.example.backend.entities.base.BaseEntity;
import org.mapstruct.MappingTarget;

import java.util.List;

public interface BaseMapper<E extends BaseEntity, D extends BaseDTO> {
    D toDto(E entity);
    E toEntity(D dto);
    List<D> toDtoList(List<E> entities);
    List<E> toEntityList(List<D> dtos);
    void updateEntity(D dto, @MappingTarget E entity);
} 