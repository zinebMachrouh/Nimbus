package com.example.backend.dto.student;

import com.example.backend.dto.base.BaseDTO;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class StudentDTO extends BaseDTO {
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Long parentId;
    private String parentName;
    private Long schoolId;
    private String schoolName;
    private String grade;
    private String qrCode;
    private Double attendancePercentage;
    private boolean active;
    private Set<Long> tripIds;
} 