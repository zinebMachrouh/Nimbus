package com.example.backend.service;

import com.example.backend.dto.vehicle.VehicleRequest;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Admin;
import com.example.backend.service.base.BaseService;

import java.util.List;

public interface AdminService extends BaseService<Admin> {
    Admin createAdmin(Admin admin);
    List<Admin> findAllActiveAdmins();
    long countManagedSchools(Long adminId);
    long countManagedUsers(Long adminId);
    long countManagedRoutes(Long adminId);
    void assignSchoolToAdmin(Long adminId, Long schoolId);
    void removeSchoolFromAdmin(Long adminId, Long schoolId);
    List<Admin> findAdminsWithManagementStats();
    void updateAdminProfile(Long adminId, Admin updatedAdmin);
    Vehicle createVehicle(VehicleRequest request);
} 