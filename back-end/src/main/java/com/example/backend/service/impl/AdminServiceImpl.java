package com.example.backend.service.impl;

import com.example.backend.dto.vehicle.VehicleRequest;
import com.example.backend.entities.School;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Admin;
import com.example.backend.entities.user.User;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final AdminRepository repository;
    private final SchoolRepository schoolRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(AdminRepository repository, 
                          SchoolRepository schoolRepository,
                          VehicleRepository vehicleRepository,
                          PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.schoolRepository = schoolRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public Admin save(Admin admin) {
        log.debug("Saving admin: {}", admin.getEmail());
        return (Admin) repository.save(admin);
    }

    @Override
    public Admin findById(Long id) {
        log.debug("Finding admin by id: {}", id);
        return findAdminById(id);
    }

    @Override
    public List<Admin> findAll() {
        return findAllActiveAdmins();
    }

    @Override
    public Page<Admin> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(user -> (Admin) user);
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    @Override
    public long count() {
        return repository.count();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Admin", id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public Admin createAdmin(Admin admin) {
        log.debug("Creating new admin: {}", admin.getEmail());
        
        validateAdminData(admin);
        
        if (repository.existsByEmail(admin.getEmail())) {
            throw new ValidationException("email", "Email already exists");
        }

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole(User.Role.ADMIN);
        admin.setActive(true);
        
        Admin savedAdmin = (Admin) repository.save(admin);
        log.info("Successfully created admin with id: {}", savedAdmin.getId());
        return savedAdmin;
    }

    @Override
    public List<Admin> findAllActiveAdmins() {
        log.debug("Finding all active admins");
        return repository.findAllActiveAdmins();
    }

    @Override
    public long countManagedSchools(Long adminId) {
        log.debug("Counting managed schools for admin with id: {}", adminId);
        validateAdminExists(adminId);
        return repository.countManagedSchools(adminId);
    }

    @Override
    public long countManagedUsers(Long adminId) {
        log.debug("Counting managed users for admin with id: {}", adminId);
        validateAdminExists(adminId);
        return repository.countManagedUsers(adminId);
    }

    @Override
    public long countManagedRoutes(Long adminId) {
        log.debug("Counting managed routes for admin with id: {}", adminId);
        validateAdminExists(adminId);
        return repository.countManagedRoutes(adminId);
    }

    @Override
    @Transactional
    public void assignSchoolToAdmin(Long adminId, Long schoolId) {
        log.debug("Assigning school {} to admin {}", schoolId, adminId);
        Admin admin = findAdminById(adminId);
        School school = findSchoolById(schoolId);
        
        if (admin.getManagedSchools().contains(school)) {
            throw new ValidationException("School is already assigned to this admin");
        }

        admin.getManagedSchools().add(school);
        repository.save(admin);
        log.info("Successfully assigned school {} to admin {}", schoolId, adminId);
    }

    @Override
    @Transactional
    public void removeSchoolFromAdmin(Long adminId, Long schoolId) {
        log.debug("Removing school {} from admin {}", schoolId, adminId);
        Admin admin = findAdminById(adminId);
        School school = findSchoolById(schoolId);
        
        if (!admin.getManagedSchools().contains(school)) {
            throw new ValidationException("School is not assigned to this admin");
        }

        admin.getManagedSchools().remove(school);
        repository.save(admin);
        log.info("Successfully removed school {} from admin {}", schoolId, adminId);
    }

    @Override
    public List<Admin> findAdminsWithManagementStats() {
        log.debug("Finding all admins with management statistics");
        List<Admin> admins = repository.findAllActiveAdmins();
        admins.forEach(admin -> {
            admin.setManagedSchoolsCount(countManagedSchools(admin.getId()));
            admin.setManagedUsersCount(countManagedUsers(admin.getId()));
            admin.setManagedRoutesCount(countManagedRoutes(admin.getId()));
        });
        return admins;
    }

    @Override
    @Transactional
    public void updateAdminProfile(Long adminId, Admin updatedAdmin) {
        log.debug("Updating admin profile for id: {}", adminId);
        Admin admin = findAdminById(adminId);
        
        validateAdminData(updatedAdmin);
        
        if (!admin.getEmail().equals(updatedAdmin.getEmail()) && 
            repository.existsByEmail(updatedAdmin.getEmail())) {
            throw new ValidationException("email", "Email already exists");
        }

        admin.setFirstName(updatedAdmin.getFirstName());
        admin.setLastName(updatedAdmin.getLastName());
        admin.setEmail(updatedAdmin.getEmail());
        admin.setPhoneNumber(updatedAdmin.getPhoneNumber());
        
        if (StringUtils.hasText(updatedAdmin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(updatedAdmin.getPassword()));
        }

        repository.save(admin);
        log.info("Successfully updated admin profile for id: {}", adminId);
    }

    @Override
    @Transactional
    public List<Admin> saveAll(List<Admin> admins) {
        return admins.stream()
                .map(this::save)
                .toList();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        delete(id);
    }

    @Override
    public Optional<Admin> findByIdAndActiveTrue(Long id) {
        return repository.findByIdAndActiveTrue(id)
                .filter(user -> user instanceof Admin)
                .map(user -> (Admin) user);
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {
        Admin admin = findAdminById(id);
        admin.setActive(false);
        repository.save(admin);
    }

    @Override
    public List<Admin> findAllActive() {
        return repository.findAllActiveAdmins();
    }

    @Override
    @Transactional
    public Admin createDriver(Admin entity) {
        throw new UnsupportedOperationException("Operation not supported for Admin entity");
    }

    @Override
    @Transactional
    public void updateDriverProfile(Long id, Admin entity) {
        throw new UnsupportedOperationException("Operation not supported for Admin entity");
    }

    @Override
    @Transactional
    public Vehicle createVehicle(VehicleRequest request) {
        log.debug("Creating new vehicle: {}", request.getVehicleNumber());
        
        if (vehicleRepository.findByLicensePlateAndActiveTrue(request.getVehicleNumber()).isPresent()) {
            throw new ValidationException("vehicleNumber", "Vehicle number already exists");
        }

        School school;
        // Use schoolId from request if provided, otherwise use the last created school
        if (request.getSchoolId() != null) {
            school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new EntityNotFoundException("School", request.getSchoolId()));
            log.debug("Using school with id {} from request", school.getId());
        } else {
            // Get the last created school as fallback
            school = schoolRepository.findFirstByOrderByCreatedAtDesc()
                .orElseThrow(() -> new EntityNotFoundException("No school found. Please create a school first."));
            log.debug("Using last created school with id: {}", school.getId());
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate(request.getVehicleNumber());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setRegistrationExpiryDate(request.getRegistrationExpiryDate());
        vehicle.setLastMaintenanceDate(request.getLastMaintenanceDate());
        vehicle.setCurrentMileage(request.getCurrentMileage());
        vehicle.setCurrentLatitude(request.getInitialLatitude());
        vehicle.setCurrentLongitude(request.getInitialLongitude());
        vehicle.setActive(true);
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        vehicle.setSchool(school);
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Successfully created vehicle with id: {} for school: {}", savedVehicle.getId(), school.getId());
        return savedVehicle;
    }

    // Private helper methods
    private void validateAdminData(Admin admin) {
        if (!StringUtils.hasText(admin.getFirstName())) {
            throw new ValidationException("firstName", "First name is required");
        }
        if (!StringUtils.hasText(admin.getLastName())) {
            throw new ValidationException("lastName", "Last name is required");
        }
        if (!StringUtils.hasText(admin.getEmail())) {
            throw new ValidationException("email", "Email is required");
        }
        if (!StringUtils.hasText(admin.getPhoneNumber())) {
            throw new ValidationException("phoneNumber", "Phone number is required");
        }
        if (admin.getId() == null && !StringUtils.hasText(admin.getPassword())) {
            throw new ValidationException("password", "Password is required");
        }
    }

    private void validateAdminExists(Long adminId) {
        if (!repository.existsById(adminId)) {
            throw new EntityNotFoundException("Admin", adminId);
        }
    }

    private Admin findAdminById(Long adminId) {
        User user = repository.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin", adminId));
        if (!(user instanceof Admin)) {
            throw new EntityNotFoundException("Admin", adminId);
        }
        return (Admin) user;
    }

    private School findSchoolById(Long schoolId) {
        return schoolRepository.findById(schoolId)
                .orElseThrow(() -> new EntityNotFoundException("School", schoolId));
    }
} 