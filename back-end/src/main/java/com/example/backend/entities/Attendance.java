package com.example.backend.entities;

import com.example.backend.entities.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "attendances")
public class Attendance extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status = AttendanceStatus.PENDING;

    @Column
    private LocalDateTime scanTime;

    @Column
    private String notes;

    @Column
    private Boolean parentNotified = false;

    public enum AttendanceStatus {
        PENDING,
        PRESENT,
        ABSENT,
        ABSENT_NOTIFIED,
        EXCUSED
    }
} 