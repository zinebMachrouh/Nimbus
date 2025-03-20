package com.example.backend.controller;

import com.example.backend.dto.ReportDTO;
import com.example.backend.entities.Report;
import com.example.backend.entities.user.User;
import com.example.backend.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Create a new report
     */
    @PostMapping
    public ResponseEntity<ReportDTO> createReport(
            @Valid @RequestBody ReportDTO.ReportRequest reportRequest,
            @AuthenticationPrincipal User currentUser) {
        return new ResponseEntity<>(reportService.createReport(reportRequest, currentUser), HttpStatus.CREATED);
    }

    /**
     * Get a report by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportDTO> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    /**
     * Update an existing report
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReportDTO> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportDTO.ReportRequest reportRequest,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.updateReport(id, reportRequest, currentUser));
    }

    /**
     * Delete a report
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        reportService.deleteReport(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update the status of a report
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ReportDTO> updateReportStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReportDTO.StatusUpdateRequest statusRequest,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, statusRequest, currentUser));
    }

    /**
     * Get all reports visible to the current user
     */
    @GetMapping
    public ResponseEntity<List<ReportDTO>> getReportsForUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.getReportsForUser(currentUser));
    }

    /**
     * Get reports created by a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReportDTO>> getReportsByUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.getReportsByUser(userId, currentUser));
    }

    /**
     * Get reports for a specific school
     */
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<ReportDTO>> getReportsBySchool(
            @PathVariable Long schoolId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.getReportsBySchool(schoolId, currentUser));
    }

    /**
     * Get reports by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ReportDTO>> getReportsByType(
            @PathVariable Report.ReportType type,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.getReportsByType(type, currentUser));
    }

    /**
     * Get reports by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReportDTO>> getReportsByStatus(
            @PathVariable Report.ReportStatus status,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reportService.getReportsByStatus(status, currentUser));
    }
} 