package com.example.backend.service.impl;

import com.example.backend.dto.school.SchoolRequest;
import com.example.backend.entities.Route;
import com.example.backend.entities.School;
import com.example.backend.entities.Student;
import com.example.backend.entities.user.Admin;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.*;
import com.example.backend.service.SchoolService;
import com.example.backend.service.base.BaseServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class SchoolServiceImpl extends BaseServiceImpl<School, SchoolRepository> implements SchoolService {

    private final StudentRepository studentRepository;
    private final RouteRepository routeRepository;
    private final AdminRepository adminRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    
    private static final int MAXIMUM_STUDENTS_PER_SCHOOL = 2000;

    public SchoolServiceImpl(SchoolRepository repository,
                           StudentRepository studentRepository,
                           RouteRepository routeRepository,
                           AdminRepository adminRepository,
                             DriverRepository driverRepository,
                             VehicleRepository vehicleRepository) {
        super(repository);
        this.studentRepository = studentRepository;
        this.routeRepository = routeRepository;
        this.adminRepository = adminRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @Transactional
    public School createSchool(SchoolRequest school) {
        School newSchool = new School();
        newSchool.setName(school.getName());
        newSchool.setAddress(school.getAddress());
        newSchool.setPhoneNumber(school.getPhoneNumber());
        newSchool.setLatitude(school.getLatitude());
        newSchool.setLongitude(school.getLongitude());

        Admin lastAdmin = adminRepository.findFirstByOrderByCreatedAtDesc()
            .orElseThrow(() -> new EntityNotFoundException("No admin found. Please create an admin first."));
        
        newSchool.getAdmins().add(lastAdmin);
        lastAdmin.getManagedSchools().add(newSchool);

        return repository.save(newSchool);
    }

    @Override
    @Transactional
    public School updateSchool(Long id, SchoolRequest school) {
        School existingSchool = findSchoolById(id);
        
        if(existingSchool == null) {
            throw new EntityNotFoundException("School not found with id: " + id);
        }

        System.out.println("School name: " + school.getName());
        System.out.println("School address: " + school.getAddress());
        System.out.println("School phone number: " + school.getPhoneNumber());

        System.out.println("Existing school name: " + existingSchool.getName());

        existingSchool.setName(school.getName());
        System.out.println("Existing school name after update: " + existingSchool.getName());
        existingSchool.setAddress(school.getAddress());
        existingSchool.setPhoneNumber(school.getPhoneNumber());
        return repository.save(existingSchool);
    }
    


    @Override
    public List<School> findByNameContaining(String name) {
        return repository.findByNameContainingIgnoreCaseAndActiveTrue(name);
    }

    @Override
    public List<School> findNearbySchools(Double latitude, Double longitude, Double radiusInMeters) {
        if (latitude == null || longitude == null || radiusInMeters == null) {
            throw new ValidationException("Latitude, longitude, and radius are required");
        }
        return repository.findNearbySchools(latitude, longitude, radiusInMeters);
    }

    @Override
    public long countActiveSchools() {
        return repository.countActiveSchools();
    }

    @Override
    public Optional<School> findByIdWithStudents(Long id) {
        return Optional.ofNullable(repository.findByIdWithStudents(id));
    }

    @Override
    @Transactional
    public void addStudent(Long schoolId, Long studentId) {
        log.debug("Adding student {} to school {}", studentId, schoolId);
        
        School school = findSchoolById(schoolId);
        Student student = findStudentById(studentId);
        
        // Validate school capacity
        long currentStudentCount = studentRepository.countBySchoolIdAndActiveTrue(schoolId);
        if (currentStudentCount >= MAXIMUM_STUDENTS_PER_SCHOOL) {
            throw new ValidationException("School has reached maximum student capacity");
        }

        if (student.getSchool() != null) {
            if (student.getSchool().getId().equals(schoolId)) {
                throw new ValidationException("Student is already assigned to this school");
            }
            throw new ValidationException("Student is already assigned to another school");
        }

        student.setSchool(school);
        studentRepository.save(student);
        log.info("Successfully added student {} to school {}", studentId, schoolId);
    }

    @Override
    @Transactional
    public void removeStudent(Long schoolId, Long studentId) {
        log.debug("Removing student {} from school {}", studentId, schoolId);
        
        School school = findSchoolById(schoolId);
        Student student = findStudentById(studentId);
        
        if (!student.getSchool().equals(school)) {
            throw new ValidationException("Student is not assigned to this school");
        }

        student.setSchool(null);
        studentRepository.save(student);
        log.info("Successfully removed student {} from school {}", studentId, schoolId);
    }

    @Override
    @Transactional
    public void addRoute(Long schoolId, Long routeId) {
        log.debug("Adding route {} to school {}", routeId, schoolId);
        
        School school = findSchoolById(schoolId);
        Route route = findRouteById(routeId);
        
        if (route.getSchool() != null) {
            if (route.getSchool().getId().equals(schoolId)) {
                throw new ValidationException("Route is already assigned to this school");
            }
            throw new ValidationException("Route is already assigned to another school");
        }

        route.setSchool(school);
        routeRepository.save(route);
        log.info("Successfully added route {} to school {}", routeId, schoolId);
    }

    @Override
    @Transactional
    public void removeRoute(Long schoolId, Long routeId) {
        log.debug("Removing route {} from school {}", routeId, schoolId);
        
        School school = findSchoolById(schoolId);
        Route route = findRouteById(routeId);
        
        if (!route.getSchool().equals(school)) {
            throw new ValidationException("Route is not assigned to this school");
        }

        route.setSchool(null);
        routeRepository.save(route);
        log.info("Successfully removed route {} from school {}", routeId, schoolId);
    }

    @Override
    public List<School> findSchoolsWithStats() {
        log.debug("Finding schools with statistics");
        List<School> schools = repository.findAllByActiveTrue();
        schools.forEach(school -> {
            long activeStudents = countActiveStudents(school.getId());
            long activeRoutes = countActiveRoutes(school.getId());
            long activeDrivers = countActiveDrivers(school.getId());
            long activeVehicles = countActiveVehicles(school.getId());
            
            school.setActiveStudentsCount(activeStudents);
            school.setActiveRoutesCount(activeRoutes);
            school.setActiveDriversCount(activeDrivers);
            school.setActiveVehiclesCount(activeVehicles);
        });
        return schools;
    }

    @Override
    public long countActiveStudents(Long schoolId) {
        return studentRepository.countBySchoolIdAndActiveTrue(schoolId);
    }

    @Override
    public long countActiveRoutes(Long schoolId) {
        return routeRepository.countActiveRoutesBySchool(schoolId);
    }

    @Override
    public long countActiveDrivers(Long schoolId) {
        return driverRepository.countActiveDriversBySchool(schoolId);
    }

    @Override
    public long countActiveVehicles(Long schoolId) {
        return vehicleRepository.countActiveVehiclesBySchool(schoolId);
    }

    // Private helper methods
    private School findSchoolById(Long schoolId) {
        return repository.findById(schoolId)
                .orElseThrow(() -> new EntityNotFoundException("School not found with id: " + schoolId));
    }

    private Student findStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
    }

    private Route findRouteById(Long routeId) {
        return routeRepository.findById(routeId)
                .orElseThrow(() -> new EntityNotFoundException("Route not found with id: " + routeId));
    }
} 