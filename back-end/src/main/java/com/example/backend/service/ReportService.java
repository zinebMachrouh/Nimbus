package com.example.backend.service;

import com.example.backend.dto.ReportDTO;
import com.example.backend.entities.Report;
import com.example.backend.entities.user.User;

import java.util.List;

public interface ReportService {
    
    /**
     * Create a new report
     */
    ReportDTO createReport(ReportDTO.ReportRequest reportRequest, User currentUser);
    
    /**
     * Get a report by ID
     */
    ReportDTO getReportById(Long id);
    
    /**
     * Update an existing report
     */
    ReportDTO updateReport(Long id, ReportDTO.ReportRequest reportRequest, User currentUser);
    
    /**
     * Delete a report
     */
    void deleteReport(Long id, User currentUser);
    
    /**
     * Update the status of a report
     */
    ReportDTO updateReportStatus(Long id, ReportDTO.StatusUpdateRequest statusRequest, User currentUser);
    
    /**
     * Get all reports visible to the current user
     */
    List<ReportDTO> getReportsForUser(User currentUser);
    
    /**
     * Get reports created by a specific user
     */
    List<ReportDTO> getReportsByUser(Long userId, User currentUser);
    
    /**
     * Get reports for a specific school
     */
    List<ReportDTO> getReportsBySchool(Long schoolId, User currentUser);
    
    /**
     * Get reports by type
     */
    List<ReportDTO> getReportsByType(Report.ReportType type, User currentUser);
    
    /**
     * Get reports by status
     */
    List<ReportDTO> getReportsByStatus(Report.ReportStatus status, User currentUser);
} 