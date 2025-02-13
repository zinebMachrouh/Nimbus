package com.example.backend.controllers;

import lombok.AllArgsConstructor;
import com.example.backend.entities.Role;
import com.example.backend.dto.RoleDTO;
import com.example.backend.services.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/roles")
@AllArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody RoleDTO roleDTO) {
        Role role = Role.builder()
                .id(java.util.UUID.randomUUID().toString())
                .name(roleDTO.getName())
                .build();
        roleService.saveRole(role);
        return ResponseEntity.ok(role);
    }

    @GetMapping("/{name}")
    public ResponseEntity<?> getRoleByName(@PathVariable String name) {
        Optional<Role> role = roleService.findByName(name);
        if (role.isEmpty()) {
            return ResponseEntity.badRequest().body("Role not found");
        }else {
            return ResponseEntity.ok(role);
        }
    }
}