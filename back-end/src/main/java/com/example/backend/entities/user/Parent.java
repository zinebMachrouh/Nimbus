package com.example.backend.entities.user;

import com.example.backend.entities.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    
    @Column
    private String emergencyContact;
    
    @Column
    private String emergencyPhone;

    @OneToMany(mappedBy = "parent")
    @JsonManagedReference("parent-student")
    private Set<Student> students = new HashSet<>();

    public Parent() {
        setRole(Role.PARENT);
    }
} 