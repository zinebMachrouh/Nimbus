package com.example.backend.service.impl;

import com.example.backend.entities.School;
import com.example.backend.entities.Student;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.repository.*;
import com.example.backend.service.UserService;
import com.example.backend.service.base.BaseServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class UserServiceImpl extends BaseServiceImpl<User, UserRepository> implements UserService {

    private final PasswordEncoder passwordEncoder;
    private final ParentRepository parentRepository;
    private final DriverRepository driverRepository;
    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final VehicleRepository vehicleRepository;

    public UserServiceImpl(@Qualifier("userRepository") UserRepository repository, PasswordEncoder passwordEncoder,
                          ParentRepository parentRepository, DriverRepository driverRepository,
                          StudentRepository studentRepository, SchoolRepository schoolRepository,
                          VehicleRepository vehicleRepository) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
        this.parentRepository = parentRepository;
        this.driverRepository = driverRepository;
        this.studentRepository = studentRepository;
        this.schoolRepository = schoolRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        log.debug("Finding user by email: {}", email);
        return repository.findByEmailAndActiveTrue(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public Optional<User> findByEmailForAuthentication(String email) {
        log.debug("Finding user by email for authentication: {}", email);
        return repository.findByEmailForAuthentication(email);
    }

    @Override
    public long countActiveUsersByRole(User.Role role) {
        return repository.countActiveUsersByRole(role);
    }

    @Override
    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        log.debug("Updating password for user with id: {}", userId);
        User user = repository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    @Override
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    @Override
    @Transactional
    public User save(User user) {
        if (user.getId() == null && user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return super.save(user);
    }

    @Override
    @Transactional
    public void activateUser(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        user.setActive(true);
        repository.save(user);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        user.setActive(false);
        repository.save(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        log.debug("Changing password for user with id: {}", userId);
        User user = repository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        if (!validatePassword(oldPassword, user.getPassword())) {
            throw new SecurityException("Invalid old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    @Override
    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        log.debug("Resetting password for user with id: {}", userId);
        User user = repository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    @Override
    @Transactional
    public void updateProfile(Long userId, User updatedUser) {
        log.debug("Updating profile for user with id: {}", userId);
        User existingUser = repository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());

        repository.save(existingUser);
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws org.springframework.security.core.userdetails.UsernameNotFoundException {
        log.debug("Loading user by username: {}", username);
        return (UserDetails) findByUsernameForAuthentication(username)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "User not found with username: " + username));
    }

    @Override
    public Optional<User> findByUsername(String username) {
        log.debug("Finding user by username: {}", username);
        return repository.findByUsernameAndActiveTrue(username);
    }

    @Override
    public boolean existsByUsername(String username) {
        return repository.existsByUsername(username);
    }

    @Override
    public Optional<User> findByUsernameForAuthentication(String username) {
        log.debug("Finding user by username for authentication: {}", username);
        return repository.findByUsernameForAuthentication(username);
    }

    @Transactional
    public Parent createParent(String firstName, String lastName, String email,
                             String password, String phoneNumber, String address) {
        if (repository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        Parent parent = new Parent();
        parent.setFirstName(firstName);
        parent.setLastName(lastName);
        parent.setEmail(email);
        parent.setPassword(passwordEncoder.encode(password));
        parent.setPhoneNumber(phoneNumber);
        parent.setAddress(address);
        parent.setRole(User.Role.PARENT);
        parent.setActive(true);

        return parentRepository.save(parent);
    }

    @Transactional
    public Driver createDriver(String firstName, String lastName, String email,
                             String password, String phoneNumber, String licenseNumber,
                             LocalDateTime licenseExpiryDate, Long schoolId, Long vehicleId) {
        if (repository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (driverRepository.existsByLicenseNumber(licenseNumber)) {
            throw new IllegalArgumentException("License number already exists");
        }

        School school = schoolRepository.findByIdAndActiveTrue(schoolId)
            .orElseThrow(() -> new IllegalArgumentException("School not found"));

        Vehicle vehicle = null;
        if (vehicleId != null) {
            vehicle = vehicleRepository.findByIdAndActiveTrue(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        }

        Driver driver = new Driver();
        driver.setFirstName(firstName);
        driver.setLastName(lastName);
        driver.setEmail(email);
        driver.setPassword(passwordEncoder.encode(password));
        driver.setPhoneNumber(phoneNumber);
        driver.setLicenseNumber(licenseNumber);
        driver.setLicenseExpiryDate(licenseExpiryDate);
        driver.setSchool(school);
        driver.setVehicle(vehicle);
        driver.setRole(User.Role.DRIVER);
        driver.setStatus(Driver.DriverStatus.AVAILABLE);
        driver.setActive(true);

        return driverRepository.save(driver);
    }

    @Transactional
    public Student createStudent(String firstName, String lastName, LocalDate dateOfBirth,
                               String studentId, Long parentId, Long schoolId, Integer seatNumber) {
        Parent parent = parentRepository.findByIdAndActiveTrue(parentId)
            .orElseThrow(() -> new IllegalArgumentException("Parent not found"));

        School school = schoolRepository.findByIdAndActiveTrue(schoolId)
            .orElseThrow(() -> new IllegalArgumentException("School not found"));

        if (studentRepository.findByStudentIdAndActiveTrue(studentId).isPresent()) {
            throw new IllegalArgumentException("Student ID already exists");
        }

        Student student = new Student();
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setDateOfBirth(dateOfBirth);
        student.setStudentId(studentId);
        student.setParent(parent);
        student.setSchool(school);
        student.setSeatNumber(seatNumber);
        student.setActive(true);

        return studentRepository.save(student);
    }
}