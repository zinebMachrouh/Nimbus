package com.example.backend.service.impl;

import com.example.backend.entities.School;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.user.Driver;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VehicleServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private DriverRepository driverRepository;

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    private Vehicle testVehicle;
    private School testSchool;
    private Driver testDriver;

    @BeforeEach
    void setUp() {
        // Create a test school
        testSchool = new School();
        testSchool.setId(1L);
        testSchool.setName("Test School");

        // Create a test driver
        testDriver = new Driver();
        testDriver.setId(1L);
        testDriver.setFirstName("John");
        testDriver.setLastName("Doe");

        // Create a test vehicle
        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setMake("Toyota");
        testVehicle.setModel("Hiace");
        testVehicle.setYear(2022);
        testVehicle.setLicensePlate("ABC123");
        testVehicle.setCapacity(20);
        testVehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        testVehicle.setSchool(testSchool);
        testVehicle.setDriver(testDriver);
    }

    @Test
    @DisplayName("Should find all vehicles")
    void testFindAll() {
        // Arrange
        List<Vehicle> expectedVehicles = Arrays.asList(testVehicle);
        when(vehicleRepository.findAll()).thenReturn(expectedVehicles);

        // Act
        List<Vehicle> actualVehicles = vehicleService.findAll();

        // Assert
        assertEquals(expectedVehicles, actualVehicles);
        verify(vehicleRepository).findAll();
    }

    @Test
    @DisplayName("Should find vehicle by ID")
    void testFindById() {
        // Arrange
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        // Act
        Vehicle actualVehicle = vehicleService.findById(1L);

        // Assert
        assertEquals(testVehicle, actualVehicle);
        verify(vehicleRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when vehicle not found")
    void testFindByIdNotFound() {
        // Arrange
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> vehicleService.findById(999L));
        verify(vehicleRepository).findById(999L);
    }

    @Test
    @DisplayName("Should save vehicle")
    void testSave() {
        // Arrange
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        Vehicle savedVehicle = vehicleService.save(testVehicle);

        // Assert
        assertEquals(testVehicle, savedVehicle);
        verify(vehicleRepository).save(testVehicle);
    }

    @Test
    @DisplayName("Should delete vehicle by ID")
    void testDeleteById() {
        // Act
        vehicleService.deleteById(1L);

        // Assert
        verify(vehicleRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should find vehicles by school")
    void testFindVehiclesBySchool() {
        // Arrange
        List<Vehicle> expectedVehicles = Arrays.asList(testVehicle);
        when(schoolRepository.existsById(1L)).thenReturn(true);
        when(vehicleRepository.findVehiclesBySchool(1L)).thenReturn(expectedVehicles);

        // Act
        List<Vehicle> actualVehicles = vehicleService.findVehiclesBySchool(1L);

        // Assert
        assertEquals(expectedVehicles, actualVehicles);
        verify(schoolRepository).existsById(1L);
        verify(vehicleRepository).findVehiclesBySchool(1L);
    }

    @Test
    @DisplayName("Should throw exception when school not found")
    void testFindVehiclesBySchoolNotFound() {
        // Arrange
        when(schoolRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> vehicleService.findVehiclesBySchool(999L));
        verify(schoolRepository).existsById(999L);
        verify(vehicleRepository, never()).findVehiclesBySchool(anyLong());
    }

    @Test
    @DisplayName("Should find available vehicles")
    void testFindAvailableVehicles() {
        // Arrange
        List<Vehicle> expectedVehicles = Arrays.asList(testVehicle);
        when(vehicleRepository.findAvailableVehicles()).thenReturn(expectedVehicles);

        // Act
        List<Vehicle> actualVehicles = vehicleService.findAvailableVehicles();

        // Assert
        assertEquals(expectedVehicles, actualVehicles);
        verify(vehicleRepository).findAvailableVehicles();
    }

    @Test
    @DisplayName("Should assign vehicle to school")
    void testAssignToSchool() {
        // Arrange
        Vehicle unassignedVehicle = new Vehicle();
        unassignedVehicle.setId(1L);
        
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(unassignedVehicle));
        when(schoolRepository.findById(2L)).thenReturn(Optional.of(new School()));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(unassignedVehicle);

        // Act
        vehicleService.assignToSchool(1L, 2L);

        // Assert
        verify(vehicleRepository).findById(1L);
        verify(schoolRepository).findById(2L);
        verify(vehicleRepository).save(unassignedVehicle);
        assertNotNull(unassignedVehicle.getSchool());
    }

    @Test
    @DisplayName("Should throw exception when assigning to non-existent school")
    void testAssignToSchoolNotFound() {
        // Arrange
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(schoolRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> vehicleService.assignToSchool(1L, 999L));
        verify(vehicleRepository).findById(1L);
        verify(schoolRepository).findById(999L);
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }


    @Test
    @DisplayName("Should mark vehicle as unavailable")
    void testMarkAsUnavailable() {
        // Arrange
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.markAsUnavailable(1L);

        // Assert
        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository).save(testVehicle);
    }

    @Test
    @DisplayName("Should remove vehicle from school")
    void testRemoveFromSchool() {
        // Arrange
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.removeFromSchool(1L);

        // Assert
        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository).save(testVehicle);
        assertNull(testVehicle.getSchool());
    }

    @Test
    @DisplayName("Should perform maintenance on vehicle")
    void testPerformMaintenance() {
        // Arrange
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.performMaintenance(1L, "Regular Service", "Oil change and tire rotation");

        // Assert
        assertEquals(Vehicle.VehicleStatus.MAINTENANCE, testVehicle.getStatus());
        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository).save(testVehicle);
    }

    @Test
    @DisplayName("Should complete maintenance")
    void testCompleteMaintenance() {
        // Arrange
        testVehicle.setStatus(Vehicle.VehicleStatus.MAINTENANCE);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.completeMaintenance(1L, "Maintenance completed successfully");

        // Assert
        assertEquals(Vehicle.VehicleStatus.AVAILABLE, testVehicle.getStatus());
        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository).save(testVehicle);
    }
} 