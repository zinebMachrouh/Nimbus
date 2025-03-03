package com.example.backend.entities;

import com.example.backend.enums.SchoolStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "schools")
public class School {
    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    private String name;

    private String address;

    private String phone;

    private String email;

    private String password;

    private String principal;

    private String gps_location;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private SchoolStatus status = SchoolStatus.ACTIVE;
}
