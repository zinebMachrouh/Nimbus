package com.example.backend.dto.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminDTO extends UserDTO {
    private Integer totalManagedSchools;
    private Integer totalActiveUsers;
    private Integer totalActiveRoutes;
} 