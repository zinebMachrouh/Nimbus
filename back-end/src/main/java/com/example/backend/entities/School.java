package com.example.backend.entities;

import com.example.backend.enums.SchoolStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "schools")
public class School {
    @Id
    private String id;

    private String name;

    private String address;

    private String phone;

    private String email;

    private String password;

    private String principal;

    private String gps_location;

    @Builder.Default
    private SchoolStatus status = SchoolStatus.ACTIVE;
}
