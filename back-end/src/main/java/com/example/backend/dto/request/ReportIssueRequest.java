package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportIssueRequest {
    @NotBlank(message = "Issue type is required")
    private String issueType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    private String location;
    private String severity;
    private String additionalNotes;
} 