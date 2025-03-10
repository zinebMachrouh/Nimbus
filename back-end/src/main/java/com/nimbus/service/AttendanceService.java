package com.nimbus.service;

import com.nimbus.dto.AttendanceDTO;
import com.nimbus.dto.request.ConfirmAttendanceRequest;

import java.util.List;

public interface AttendanceService {
    List<AttendanceDTO> getAttendancesByTripId(Long tripId);
    List<AttendanceDTO> getAttendancesByStudentId(Long studentId);
    AttendanceDTO getAttendanceById(Long id);
    AttendanceDTO confirmAttendance(Long parentId, Long attendanceId, ConfirmAttendanceRequest confirmAttendanceRequest);
    List<AttendanceDTO> getAbsentStudentsByTripId(Long tripId);
}

