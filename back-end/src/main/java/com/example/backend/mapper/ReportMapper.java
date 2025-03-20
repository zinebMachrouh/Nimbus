package com.example.backend.mapper;

import com.example.backend.dto.ReportDTO;
import com.example.backend.entities.Report;
import com.example.backend.entities.School;
import com.example.backend.entities.user.User;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {
    
    /**
     * Convert a Report entity to a ReportDTO
     */
    public ReportDTO toDTO(Report report) {
        if (report == null) {
            return null;
        }
        
        return ReportDTO.builder()
                .id(report.getId())
                .title(report.getTitle())
                .content(report.getContent())
                .createdAt(report.getCreatedAt())
                .type(report.getType())
                .status(report.getStatus())
                .senderId(report.getSender().getId())
                .senderName(report.getSender().getFirstName() + " " + report.getSender().getLastName())
                .senderRole(report.getSender().getRole().toString())
                .schoolId(report.getSchool() != null ? report.getSchool().getId() : null)
                .schoolName(report.getSchool() != null ? report.getSchool().getName() : null)
                .build();
    }
    
    /**
     * Create a new Report entity from a ReportRequest DTO
     */
    public Report toEntity(ReportDTO.ReportRequest dto, User sender, School school) {
        Report report = new Report();
        report.setTitle(dto.getTitle());
        report.setContent(dto.getContent());
        report.setType(dto.getType());
        report.setSender(sender);
        report.setSchool(school);
        report.setCreatedAt(java.time.LocalDateTime.now());
        report.setStatus(Report.ReportStatus.PENDING);
        return report;
    }
    
    /**
     * Update an existing Report entity from a ReportRequest DTO
     */
    public void updateEntityFromDTO(ReportDTO.ReportRequest dto, Report report, School school) {
        report.setTitle(dto.getTitle());
        report.setContent(dto.getContent());
        report.setType(dto.getType());
        report.setSchool(school);
    }
} 