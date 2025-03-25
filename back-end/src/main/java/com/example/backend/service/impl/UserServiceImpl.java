package com.example.backend.service.impl;

import com.example.backend.entities.School;
import com.example.backend.entities.Student;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.user.Parent;
import com.example.backend.entities.user.User;
import com.example.backend.repository.*;
import com.example.backend.service.EmailService;
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
import java.util.List;
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
    private final EmailService emailService;    

    public UserServiceImpl(@Qualifier("userRepository") UserRepository repository, PasswordEncoder passwordEncoder,
                          ParentRepository parentRepository, DriverRepository driverRepository,
                          StudentRepository studentRepository, SchoolRepository schoolRepository,
                          VehicleRepository vehicleRepository, EmailService emailService) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
        this.parentRepository = parentRepository;
        this.driverRepository = driverRepository;
        this.studentRepository = studentRepository;
        this.schoolRepository = schoolRepository;
        this.vehicleRepository = vehicleRepository;
        this.emailService = emailService;
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

    @Override
    public List<User> findByRole(User.Role role) {
        log.debug("Finding users by role: {}", role);
        return repository.findByRoleAndActiveTrue(role);
    }

    @Override
    public List<Parent> findAllParents() {
        log.debug("Finding all active parents");
        return parentRepository.findByActiveTrue();
    }

    @Override
    public List<Parent> findAllParentsIncludingInactive() {
        log.debug("Finding all parents including inactive ones");
        return parentRepository.findAllIncludingInactive();
    }

    @Override
    @Transactional
    public Parent updateParent(Long parentId, String firstName, String lastName, String email, 
                            String phoneNumber, String address, String emergencyContact, String emergencyPhone) {
        log.debug("Updating parent with ID: {}", parentId);
        
        Parent parent = parentRepository.findById(parentId)
            .orElseThrow(() -> new EntityNotFoundException("Parent not found with ID: " + parentId));
            
        // Check if email is being changed and if the new email already exists
        if (!parent.getEmail().equals(email) && repository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        parent.setFirstName(firstName);
        parent.setLastName(lastName);
        parent.setEmail(email);
        parent.setPhoneNumber(phoneNumber);
        parent.setAddress(address);
        parent.setEmergencyContact(emergencyContact);
        parent.setEmergencyPhone(emergencyPhone);
        // Don't change active status here - let the controller handle it
        
        return parentRepository.save(parent);
    }
    
    @Override
    @Transactional
    public void deleteParent(Long parentId) {
        log.debug("Deleting parent with ID: {}", parentId);
        
        Parent parent = parentRepository.findById(parentId)
            .orElseThrow(() -> new EntityNotFoundException("Parent not found with ID: " + parentId));
            
        // Check if parent has any students
        long studentCount = studentRepository.countByParentIdAndActiveTrue(parentId);
        if (studentCount > 0) {
            throw new IllegalStateException("Cannot delete parent with associated students");
        }
        
        // Soft delete by setting active to false instead of physically deleting
        parent.setActive(false);
        parentRepository.save(parent);
    }
    
    @Override
    @Transactional
    public Parent toggleParentStatus(Long parentId, boolean isActive) {
        log.debug("Toggling parent status with ID: {} to {}", parentId, isActive);
        
        Parent parent = parentRepository.findById(parentId)
            .orElseThrow(() -> new EntityNotFoundException("Parent not found with ID: " + parentId));
            
        parent.setActive(isActive);
        return parentRepository.save(parent);
    }

    @Transactional
    @Override
    public Parent createParent(String firstName, String lastName, String email,
                             String password, String phoneNumber, String address) {
        if (repository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        Parent parent = new Parent();
        parent.setFirstName(firstName);
        parent.setLastName(lastName);
        parent.setEmail(email);
        
        // Generate username from first and last name
        String username = generateUsername(firstName, lastName);
        // Make sure the username is unique
        if (existsByUsername(username)) {
            // Add a number to make it unique
            int counter = 1;
            String baseUsername = username;
            while (existsByUsername(username)) {
                username = baseUsername + counter;
                counter++;
            }
        }
        parent.setUsername(username);
        
        parent.setPassword(passwordEncoder.encode(password));
        parent.setPhoneNumber(phoneNumber);
        parent.setAddress(address);
        parent.setRole(User.Role.PARENT);
        parent.setActive(true);

        Parent savedParent = parentRepository.save(parent);

        if (savedParent != null) {
            emailService.sendWelcomeEmail(email, savedParent.getFirstName(), password, "Parent");
        }

        return savedParent;
    }

    @Transactional
    @Override
    public Driver createDriver(String firstName, String lastName, String email,
                             String password, String phoneNumber, String licenseNumber,
                             LocalDateTime licenseExpiryDate, Long schoolId, Long vehicleId,
                             String providedUsername) {
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
        
        // Use provided username or generate one
        String username;
        if (providedUsername != null && !providedUsername.isEmpty()) {
            username = providedUsername;
            // Check if username exists
            if (existsByUsername(username)) {
                // Add a number to make it unique
                int counter = 1;
                String baseUsername = username;
                while (existsByUsername(username)) {
                    username = baseUsername + counter;
                    counter++;
                }
            }
        } else {
            // Generate username from first and last name
            username = generateUsername(firstName, lastName);
            // Make sure the username is unique
            if (existsByUsername(username)) {
                // Add a number to make it unique
                int counter = 1;
                String baseUsername = username;
                while (existsByUsername(username)) {
                    username = baseUsername + counter;
                    counter++;
                }
            }
        }
        driver.setUsername(username);
        
        driver.setPassword(passwordEncoder.encode(password));
        driver.setPhoneNumber(phoneNumber);
        driver.setLicenseNumber(licenseNumber);
        driver.setLicenseExpiryDate(licenseExpiryDate);
        driver.setSchool(school);
        driver.setVehicle(vehicle);
        driver.setRole(User.Role.DRIVER);
        driver.setStatus(Driver.DriverStatus.AVAILABLE);
        driver.setActive(true);

        Driver savedDriver = driverRepository.save(driver);
        if (savedDriver != null) {
            emailService.sendWelcomeEmail(email, savedDriver.getFirstName(), password, "Driver");
        }
        return savedDriver;
    }

    @Transactional
    @Override
    public Student createStudent(String firstName, String lastName, LocalDate dateOfBirth,
                               Long parentId, Long schoolId, Integer seatNumber) {
        Parent parent = parentRepository.findByIdAndActiveTrue(parentId)
            .orElseThrow(() -> new IllegalArgumentException("Parent not found"));

        School school = schoolRepository.findByIdAndActiveTrue(schoolId)
            .orElseThrow(() -> new IllegalArgumentException("School not found"));

        Student student = new Student();
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setDateOfBirth(dateOfBirth);
        student.setParent(parent);
        student.setSchool(school);
        student.setSeatNumber(seatNumber);
        student.setActive(true);

        // Generate student ID
        String studentId = generateStudentId(schoolId);
        student.setStudentId(studentId);

        return studentRepository.save(student);
    }

    private String generateStudentId(Long schoolId) {
        // Get current year
        String year = String.valueOf(LocalDate.now().getYear());
        
        // Get school code (first 3 letters of school name or ID)
        School school = schoolRepository.findById(schoolId)
            .orElseThrow(() -> new IllegalArgumentException("School not found"));
        String schoolCode = school.getName().substring(0, Math.min(3, school.getName().length())).toUpperCase();
        
        // Get next sequence number for this school
        long nextSequence = studentRepository.countBySchoolIdAndActiveTrue(schoolId) + 1;
        
        // Format: YYYY-SCHOOL-XXXX (e.g., 2024-ABC-0001)
        return String.format("%s-%s-%04d", year, schoolCode, nextSequence);
    }

    /**
     * Generate a username from the first and last name
     * @param firstName First name
     * @param lastName Last name
     * @return Generated username
     */
    private String generateUsername(String firstName, String lastName) {
        // Remove spaces and special characters, then combine first and last name
        String cleanFirstName = firstName.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String cleanLastName = lastName.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return cleanFirstName + "." + cleanLastName;
    }

    @Override
    public Parent updateParent(Long parentId, String emergencyContact, String emergencyPhone) {
        log.debug("Updating parent with ID: {}", parentId);
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new EntityNotFoundException("Parent not found with id: " + parentId));
        parent.setEmergencyContact(emergencyContact);
        parent.setEmergencyPhone(emergencyPhone);
        // Don't change active status here - let the controller handle it
        return parentRepository.save(parent);
    }
    
    /**
     * Ensures that a parent's active status is properly set and not null
     * @param parent The parent entity to check
     * @return The parent with active status set properly
     */
    @Override
    public Parent ensureActiveStatus(Parent parent) {
        Boolean activeStatus = parent.isActive();
        if (activeStatus == null) {
            log.debug("Setting null active status to true for parent: {}", parent.getId());
            parent.setActive(true);
            return parentRepository.save(parent);
        }
        return parent;
    }

    @Override
    @Transactional
    public Parent save(Parent parent) {
        // Use the generic save method to handle password encoding if needed
        if (parent.getId() == null && parent.getPassword() != null) {
            parent.setPassword(passwordEncoder.encode(parent.getPassword()));
        }
        return parentRepository.save(parent);
    }
}