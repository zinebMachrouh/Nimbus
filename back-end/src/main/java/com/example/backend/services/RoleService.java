package com.example.backend.services;

import com.example.backend.entities.Role;

import java.util.Optional;

public interface RoleService {
    Optional<Role> findByName(String name);
    Role saveRole(Role role);
}
