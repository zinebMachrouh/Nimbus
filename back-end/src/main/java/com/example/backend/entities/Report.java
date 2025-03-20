package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import com.example.backend.entities.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "reports")
public class Report extends BaseEntity {
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 2000)
    private String content;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType type;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;
    
    // Status of the report
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.PENDING;
    
    // Constructor with required fields
    public Report(String title, String content, ReportType type, User sender, School school) {
        this.title = title;
        this.content = content;
        this.type = type;
        this.sender = sender;
        this.school = school;
        this.createdAt = LocalDateTime.now();
        this.status = ReportStatus.PENDING;
    }
    
    // Pre persist hook to set creation time
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Enums for report type and status
    public enum ReportType {
        INCIDENT, MAINTENANCE, BEHAVIOR, ANNOUNCEMENT, OTHER
    }
    
    public enum ReportStatus {
        PENDING, RESOLVED, IN_PROGRESS, REJECTED
    }
} 