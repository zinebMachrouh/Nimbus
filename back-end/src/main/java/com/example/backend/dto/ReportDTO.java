package com.example.backend.dto;

import com.example.backend.entities.Report;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    
    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 2000, message = "Content must be between 10 and 2000 characters")
    private String content;
    
    private LocalDateTime createdAt;
    
    @NotNull(message = "Report type is required")
    private Report.ReportType type;
    
    private Report.ReportStatus status;
    
    // Sender information
    private Long senderId;
    private String senderName;
    private String senderRole;
    
    // School information
    private Long schoolId;
    private String schoolName;
    
    // Request DTO for creating and updating reports
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
        private String title;
        
        @NotBlank(message = "Content is required")
        @Size(min = 10, max = 2000, message = "Content must be between 10 and 2000 characters")
        private String content;
        
        @NotNull(message = "Report type is required")
        private Report.ReportType type;
        
        private Long schoolId;
    }
    
    // Response DTO for report status updates
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private Report.ReportStatus status;
    }
} 