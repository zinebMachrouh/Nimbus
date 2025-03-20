package com.example.backend.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ParentDTO extends UserDTO {
    private String address;
    private List<StudentSummary> students;
    private List<NotificationSummary> recentNotifications;

    @Getter
    @Setter
    public static class StudentSummary {
        private Long studentId;
        private String fullName;
        private String schoolName;
        private Integer seatNumber;
        private TripStatus currentTripStatus;
    }

    @Getter
    @Setter
    public static class NotificationSummary {
        private Long id;
        private String studentName;
        private String type;
        private String message;
        private String timestamp;
        private boolean read;
    }

    public enum TripStatus {
        NOT_STARTED,
        WAITING_FOR_PICKUP,
        ON_BUS,
        DROPPED_OFF,
        ABSENT
    }
} 