package com.example.backend.dto.trip;

import com.example.backend.dto.base.BaseDTO;
import com.example.backend.entities.Trip;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class TripDTO extends BaseDTO {
    private Long routeId;
    private String routeName;
    private Long driverId;
    private String driverName;
    private Long vehicleId;
    private String vehicleNumber;
    private LocalDateTime scheduledDepartureTime;
    private LocalDateTime actualDepartureTime;
    private LocalDateTime actualArrivalTime;
    private Trip.TripStatus status;
    private String notes;
    private List<TripAttendanceDTO> attendances;
    private Double currentLatitude;
    private Double currentLongitude;
    private Double currentSpeed;

    @Getter
    @Setter
    public static class TripAttendanceDTO {
        private Long studentId;
        private String studentName;
        private Integer seatNumber;
        private String attendanceStatus;
        private LocalDateTime scanTime;
    }
} 