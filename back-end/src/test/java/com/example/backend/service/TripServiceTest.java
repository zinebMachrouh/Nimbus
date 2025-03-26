package com.example.backend.service;

import com.example.backend.dto.trip.TripRequest;
import com.example.backend.entities.Trip;
import com.example.backend.entities.Vehicle;
import com.example.backend.entities.Route;
import com.example.backend.entities.user.Driver;
import com.example.backend.entities.Student;
import com.example.backend.repository.*;
import com.example.backend.service.impl.TripServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @InjectMocks
    private TripServiceImpl tripService;

    private Trip trip;
    private Driver driver;
    private Vehicle vehicle;
    private Route route;
    private Student student;
    private TripRequest tripRequest;

    @BeforeEach
    void setUp() {
        // Initialize test data
        driver = new Driver();
        driver.setId(1L);
        driver.setFirstName("John");
        driver.setLastName("Doe");
        driver.setLicenseNumber("DL123456");
        driver.setLicenseExpiryDate(LocalDateTime.now().plusYears(1));
        driver.setStatus(Driver.DriverStatus.AVAILABLE);

        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setLicensePlate("ABC123");
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2020);
        vehicle.setCapacity(20);
        vehicle.setInsuranceExpiryDate(LocalDate.now().plusYears(1));
        vehicle.setRegistrationExpiryDate(LocalDate.now().plusYears(1));
        vehicle.setLastMaintenanceDate(LocalDate.now());
        vehicle.setCurrentMileage(10000.0);
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);

        route = new Route();
        route.setId(1L);
        route.setName("Test Route");
        route.setDescription("Test Route Description");
        route.setType(Route.RouteType.MORNING_PICKUP);
        route.setStatus(Route.RouteStatus.ACTIVE);

        student = new Student();
        student.setId(1L);
        student.setFirstName("Jane");
        student.setLastName("Smith");
        student.setDateOfBirth(LocalDate.now().minusYears(10));
        student.setGrade("5th Grade");

        LocalDateTime scheduledTime = LocalDateTime.now().plusMinutes(15);
        
        trip = new Trip();
        trip.setId(1L);
        trip.setDriver(driver);
        trip.setVehicle(vehicle);
        trip.setRoute(route);
        trip.setStatus(Trip.TripStatus.SCHEDULED);
        trip.setScheduledDepartureTime(scheduledTime);

        tripRequest = new TripRequest();
        tripRequest.setRouteId(1L);
        tripRequest.setScheduledDepartureTime(scheduledTime);

        // Set up default mocks
        when(driverRepository.findById(1L)).thenReturn(Optional.of(driver));
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
    }

    @Test
    void createTrip_Success() {
        // Arrange
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        // Act
        Trip result = tripService.create(tripRequest);

        // Assert
        assertNotNull(result);
        assertEquals(route, result.getRoute());
        assertEquals(tripRequest.getScheduledDepartureTime(), result.getScheduledDepartureTime());
        verify(tripRepository).save(any(Trip.class));
    }

    @Test
    void createTrip_InvalidSchedule_ThrowsException() {
        // Arrange
        tripRequest.setScheduledDepartureTime(LocalDateTime.now().minusHours(1));

        // Act & Assert
        assertThrows(ValidationException.class, () -> tripService.create(tripRequest));
        verify(tripRepository, never()).save(any(Trip.class));
    }

    @Test
    void assignDriver_Success() {
        // Arrange
        trip.setDriver(null); // Ensure trip has no driver assigned
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        // Act
        tripService.assignDriver(1L, 1L);

        // Assert
        assertEquals(driver, trip.getDriver());
        verify(tripRepository).save(trip);
    }

    @Test
    void startTrip_Success() {
        // Arrange
        trip.setScheduledDepartureTime(LocalDateTime.now().plusMinutes(15));
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        // Act
        tripService.startTrip(1L);

        // Assert
        assertEquals(Trip.TripStatus.IN_PROGRESS, trip.getStatus());
        assertNotNull(trip.getActualDepartureTime());
        verify(tripRepository).save(trip);
    }

    @Test
    void completeTrip_Success() {
        // Arrange
        trip.setStatus(Trip.TripStatus.IN_PROGRESS);
        trip.setActualDepartureTime(LocalDateTime.now().minusMinutes(30));
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        // Act
        tripService.completeTrip(1L);

        // Assert
        assertEquals(Trip.TripStatus.COMPLETED, trip.getStatus());
        assertNotNull(trip.getActualArrivalTime());
        verify(tripRepository).save(trip);
    }

    @Test
    void findByDriverId_Success() {
        // Arrange
        List<Trip> trips = Arrays.asList(trip);
        when(tripRepository.findByDriverIdAndActiveTrue(1L)).thenReturn(trips);

        // Act
        List<Trip> result = tripService.findByDriverId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(trip, result.get(0));
        verify(tripRepository).findByDriverIdAndActiveTrue(1L);
    }

    @Test
    void findByDriverId_EmptyList() {
        // Arrange
        when(tripRepository.findByDriverIdAndActiveTrue(1L)).thenReturn(Arrays.asList());

        // Act
        List<Trip> result = tripService.findByDriverId(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(tripRepository).findByDriverIdAndActiveTrue(1L);
    }

    @Test
    void findByDriverId_NullDriverId_ThrowsException() {
        // Act & Assert
        assertThrows(ValidationException.class, () -> tripService.findByDriverId(null));
        verify(tripRepository, never()).findByDriverIdAndActiveTrue(any());
    }
} 