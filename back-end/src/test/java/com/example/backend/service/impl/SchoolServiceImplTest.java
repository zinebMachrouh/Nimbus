package com.example.backend.service.impl;

import com.example.backend.dto.school.SchoolRequest;
import com.example.backend.entities.School;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.entities.user.Admin;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SchoolServiceImplTest {

    @Mock
    private SchoolRepository schoolRepository;
    
    @Mock
    private StudentRepository studentRepository;
    
    @Mock
    private RouteRepository routeRepository;
    
    @Mock
    private AdminRepository adminRepository;
    
    @Mock
    private DriverRepository driverRepository;
    
    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private SchoolServiceImpl schoolService;

    private School testSchool;
    private SchoolRequest testSchoolRequest;
    private Admin testAdmin;

    @BeforeEach
    void setUp() {
        // Create a test school
        testSchool = new School();
        testSchool.setId(1L);
        testSchool.setName("Test School");
        testSchool.setAddress("123 School Ave");
        testSchool.setPhoneNumber("(123) 456-7890");
        testSchool.setLatitude(37.7749);
        testSchool.setLongitude(-122.4194);
        
        // Create a test admin
        testAdmin = new Admin();
        testAdmin.setId(1L);
        testAdmin.setManagedSchools(new HashSet<>());
        
        // Create a test school request
        testSchoolRequest = new SchoolRequest();
        testSchoolRequest.setName("Test School");
        testSchoolRequest.setAddress("123 School Ave");
        testSchoolRequest.setPhoneNumber("(123) 456-7890");
        testSchoolRequest.setLatitude(37.7749);
        testSchoolRequest.setLongitude(-122.4194);
    }

    @Test
    @DisplayName("Should find all schools")
    void testFindAll() {
        // Arrange
        List<School> expectedSchools = Arrays.asList(testSchool);
        when(schoolRepository.findAll()).thenReturn(expectedSchools);

        // Act
        List<School> actualSchools = schoolService.findAll();

        // Assert
        assertEquals(expectedSchools, actualSchools);
        verify(schoolRepository).findAll();
    }

    @Test
    @DisplayName("Should find school by ID")
    void testFindById() {
        // Arrange
        when(schoolRepository.findById(1L)).thenReturn(Optional.of(testSchool));

        // Act
        School actualSchool = schoolService.findById(1L);

        // Assert
        assertEquals(testSchool, actualSchool);
        verify(schoolRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when school not found")
    void testFindByIdNotFound() {
        // Arrange
        when(schoolRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> schoolService.findById(999L));
        verify(schoolRepository).findById(999L);
    }

    @Test
    @DisplayName("Should save school")
    void testSave() {
        // Arrange
        when(schoolRepository.save(any(School.class))).thenReturn(testSchool);

        // Act
        School savedSchool = schoolService.save(testSchool);

        // Assert
        assertEquals(testSchool, savedSchool);
        verify(schoolRepository).save(testSchool);
    }

    @Test
    @DisplayName("Should delete school by ID")
    void testDeleteById() {
        // Arrange
        doNothing().when(schoolRepository).deleteById(1L);

        // Act
        schoolService.deleteById(1L);

        // Assert
        verify(schoolRepository).deleteById(1L);
    }
    
    @Test
    @DisplayName("Should create a new school")
    void testCreateSchool() {
        // Arrange
        when(adminRepository.findFirstByOrderByCreatedAtDesc()).thenReturn(Optional.of(testAdmin));
        when(schoolRepository.save(any(School.class))).thenReturn(testSchool);
        
        // Act
        School createdSchool = schoolService.createSchool(testSchoolRequest);
        
        // Assert
        assertEquals(testSchool, createdSchool);
        verify(adminRepository).findFirstByOrderByCreatedAtDesc();
        verify(schoolRepository).save(any(School.class));
    }
    
    @Test
    @DisplayName("Should throw exception when creating school with no admin")
    void testCreateSchoolNoAdmin() {
        // Arrange
        when(adminRepository.findFirstByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> schoolService.createSchool(testSchoolRequest));
        verify(adminRepository).findFirstByOrderByCreatedAtDesc();
        verify(schoolRepository, never()).save(any(School.class));
    }
    
    @Test
    @DisplayName("Should update an existing school")
    void testUpdateSchool() {
        // Arrange
        when(schoolRepository.findById(1L)).thenReturn(Optional.of(testSchool));
        when(schoolRepository.save(any(School.class))).thenReturn(testSchool);
        
        // Act
        School updatedSchool = schoolService.updateSchool(1L, testSchoolRequest);
        
        // Assert
        assertEquals(testSchool, updatedSchool);
        assertEquals("Test School", updatedSchool.getName());
        assertEquals("123 School Ave", updatedSchool.getAddress());
        assertEquals("(123) 456-7890", updatedSchool.getPhoneNumber());
        verify(schoolRepository).findById(1L);
        verify(schoolRepository).save(testSchool);
    }
    
    @Test
    @DisplayName("Should throw exception when updating non-existent school")
    void testUpdateSchoolNotFound() {
        // Arrange
        when(schoolRepository.findById(999L)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> schoolService.updateSchool(999L, testSchoolRequest));
        verify(schoolRepository).findById(999L);
        verify(schoolRepository, never()).save(any(School.class));
    }
    
    @Test
    @DisplayName("Should find schools by name containing")
    void testFindByNameContaining() {
        // Arrange
        List<School> expectedSchools = Arrays.asList(testSchool);
        when(schoolRepository.findByNameContainingIgnoreCaseAndActiveTrue("Test")).thenReturn(expectedSchools);
        
        // Act
        List<School> actualSchools = schoolService.findByNameContaining("Test");
        
        // Assert
        assertEquals(expectedSchools, actualSchools);
        verify(schoolRepository).findByNameContainingIgnoreCaseAndActiveTrue("Test");
    }
    
    @Test
    @DisplayName("Should check if school exists by ID")
    void testExistsById() {
        // Arrange
        when(schoolRepository.existsById(1L)).thenReturn(true);
        when(schoolRepository.existsById(999L)).thenReturn(false);
        
        // Act & Assert
        assertTrue(schoolService.existsById(1L));
        assertFalse(schoolService.existsById(999L));
        verify(schoolRepository).existsById(1L);
        verify(schoolRepository).existsById(999L);
    }
} 