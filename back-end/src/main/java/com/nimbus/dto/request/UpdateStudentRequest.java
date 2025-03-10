package com.nimbus.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateStudentRequest {
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;
    
    private Long parentId;
    
    private Long routeId;
    private boolean routeIdPresent;
    
    private Integer seatNumber;
    
    private Boolean active;
}

