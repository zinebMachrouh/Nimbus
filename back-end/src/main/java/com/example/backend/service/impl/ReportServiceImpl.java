package com.example.backend.service.impl;

import com.example.backend.dto.ReportDTO;
import com.example.backend.entities.Report;
import com.example.backend.entities.School;
import com.example.backend.entities.user.Admin;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.mapper.ReportMapper;
import com.example.backend.repository.ReportRepository;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final ReportMapper reportMapper;

    @Override
    public ReportDTO createReport(ReportDTO.ReportRequest reportRequest, User currentUser) {
        // Only admins and drivers can create reports
        if (currentUser.getRole() != User.Role.ADMIN && currentUser.getRole() != User.Role.DRIVER) {
            throw new UnauthorizedException("Only administrators and drivers can create reports");
        }

        School school = null;
        if (reportRequest.getSchoolId() != null) {
            school = schoolRepository.findById(reportRequest.getSchoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("School not found with id: " + reportRequest.getSchoolId()));
            
            // Check if user has access to this school
            if (!hasAccessToSchool(currentUser, school)) {
                throw new UnauthorizedException("You don't have access to this school");
            }
        } else if (currentUser.getRole() == User.Role.DRIVER) {
            // If driver doesn't specify school, use their assigned school
            Driver driver = (Driver) currentUser;
            if (driver.getSchool() != null) {
                school = driver.getSchool();
            } else {
                throw new UnauthorizedException("Driver must be assigned to a school to create reports");
            }
        }

        Report report = reportMapper.toEntity(reportRequest, currentUser, school);
        report = reportRepository.save(report);
        return reportMapper.toDTO(report);
    }

    @Override
    public ReportDTO getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
        return reportMapper.toDTO(report);
    }

    @Override
    public ReportDTO updateReport(Long id, ReportDTO.ReportRequest reportRequest, User currentUser) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        // Only the author or admin can update a report
        if (!report.getSender().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to update this report");
        }

        School school = null;
        if (reportRequest.getSchoolId() != null) {
            school = schoolRepository.findById(reportRequest.getSchoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("School not found with id: " + reportRequest.getSchoolId()));
            
            // Check if user has access to this school
            if (!hasAccessToSchool(currentUser, school)) {
                throw new UnauthorizedException("You don't have access to this school");
            }
        } else {
            school = report.getSchool();
        }

        reportMapper.updateEntityFromDTO(reportRequest, report, school);
        report = reportRepository.save(report);
        return reportMapper.toDTO(report);
    }

    @Override
    public void deleteReport(Long id, User currentUser) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        // Only the author or admin can delete a report
        if (!report.getSender().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to delete this report");
        }

        reportRepository.delete(report);
    }

    @Override
    public ReportDTO updateReportStatus(Long id, ReportDTO.StatusUpdateRequest statusRequest, User currentUser) {
        // Only admins can update status
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only administrators can update report status");
        }

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        // Check if admin has access to this school
        if (report.getSchool() != null && !hasAccessToSchool(currentUser, report.getSchool())) {
            throw new UnauthorizedException("You don't have access to reports from this school");
        }

        report.setStatus(statusRequest.getStatus());
        report = reportRepository.save(report);
        return reportMapper.toDTO(report);
    }

    @Override
    public List<ReportDTO> getReportsForUser(User currentUser) {
        List<Report> reports;

        switch (currentUser.getRole()) {
            case ADMIN:
                Admin admin = (Admin) currentUser;
                List<School> managedSchools = new ArrayList<>(admin.getManagedSchools());
                reports = reportRepository.findReportsVisibleToUser(managedSchools, "ADMIN");
                break;
            case DRIVER:
                Driver driver = (Driver) currentUser;
                School driverSchool = driver.getSchool();
                List<School> driverSchools = driverSchool != null ? List.of(driverSchool) : List.of();
                reports = reportRepository.findReportsVisibleToUser(driverSchools, "DRIVER");
                break;
            case PARENT:
                Parent parent = (Parent) currentUser;
                List<School> studentSchools = parent.getStudents().stream()
                        .map(s -> s.getSchool())
                        .distinct()
                        .collect(Collectors.toList());
                if (studentSchools.isEmpty()) {
                    reports = new ArrayList<>();
                } else {
                    reports = reportRepository.findBySchoolOrderByCreatedAtDesc(studentSchools.get(0));
                }
                break;
            default:
                throw new UnauthorizedException("Unknown user role");
        }

        return reports.stream()
                .map(reportMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReportDTO> getReportsByUser(Long userId, User currentUser) {
        // Only admins can view reports by specific user
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only administrators can view reports by specific user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        List<Report> reports = reportRepository.findBySenderOrderByCreatedAtDesc(user);
        return reports.stream()
                .map(reportMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReportDTO> getReportsBySchool(Long schoolId, User currentUser) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found with id: " + schoolId));

        // Check if user has access to this school
        if (!hasAccessToSchool(currentUser, school)) {
            throw new UnauthorizedException("You don't have access to reports from this school");
        }

        List<Report> reports = reportRepository.findBySchoolOrderByCreatedAtDesc(school);
        return reports.stream()
                .map(reportMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReportDTO> getReportsByType(Report.ReportType type, User currentUser) {
        List<Report> reports;
        
        switch (currentUser.getRole()) {
            case ADMIN:
                Admin admin = (Admin) currentUser;
                List<School> managedSchools = new ArrayList<>(admin.getManagedSchools());
                if (managedSchools.isEmpty()) {
                    reports = new ArrayList<>();
                } else {
                    reports = reportRepository.findBySchoolAndTypeOrderByCreatedAtDesc(managedSchools.get(0), type);
                }
                break;
            case DRIVER:
                Driver driver = (Driver) currentUser;
                if (driver.getSchool() == null) {
                    reports = new ArrayList<>();
                } else {
                    reports = reportRepository.findBySchoolAndTypeOrderByCreatedAtDesc(driver.getSchool(), type);
                }
                break;
            case PARENT:
                Parent parent = (Parent) currentUser;
                List<School> studentSchools = parent.getStudents().stream()
                        .map(s -> s.getSchool())
                        .distinct()
                        .collect(Collectors.toList());
                if (studentSchools.isEmpty()) {
                    reports = new ArrayList<>();
                } else {
                    reports = reportRepository.findBySchoolAndTypeOrderByCreatedAtDesc(studentSchools.get(0), type);
                }
                break;
            default:
                throw new UnauthorizedException("Unknown user role");
        }

        return reports.stream()
                .map(reportMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReportDTO> getReportsByStatus(Report.ReportStatus status, User currentUser) {
        // Only admins can filter by status
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only administrators can filter reports by status");
        }
        
        List<Report> reports = reportRepository.findByStatusOrderByCreatedAtDesc(status);
        return reports.stream()
                .map(reportMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if the user has access to the given school
     */
    private boolean hasAccessToSchool(User user, School school) {
        if (user.getRole() == User.Role.ADMIN) {
            Admin admin = (Admin) user;
            return admin.getManagedSchools().contains(school);
        } else if (user.getRole() == User.Role.DRIVER) {
            Driver driver = (Driver) user;
            return driver.getSchool() != null && driver.getSchool().getId().equals(school.getId());
        } else if (user.getRole() == User.Role.PARENT) {
            Parent parent = (Parent) user;
            return parent.getStudents().stream()
                    .anyMatch(student -> student.getSchool() != null && 
                              student.getSchool().getId().equals(school.getId()));
        }
        return false;
    }
} 