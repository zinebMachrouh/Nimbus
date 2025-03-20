package com.example.backend.entities.user;

import com.example.backend.entities.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "parents")
public class Parent extends User {
    
    @Column(nullable = false)
    private String address;

    @OneToMany(mappedBy = "parent")
    private Set<Student> students = new HashSet<>();

    public Parent() {
        setRole(Role.PARENT);
    }
} 