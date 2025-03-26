package com.example.backend.service;

import com.example.backend.entities.Route;
import com.example.backend.entities.School;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.SchoolRepository;
import com.example.backend.service.impl.RouteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private RouteServiceImpl routeService;

    private Route route;
    private School school;
    private Route.RouteStop stop1;
    private Route.RouteStop stop2;

    @BeforeEach
    void setUp() {
        // Initialize test data
        school = new School();
        school.setId(1L);
        school.setName("Test School");
        school.setAddress("Test Address");

        // Create RouteStop objects with correct constructor parameter order
        stop1 = new Route.RouteStop();
        stop1.setName("Stop 1");
        stop1.setAddress("123 Main St");
        stop1.setLatitude(40.7128);
        stop1.setLongitude(-74.0060);
        stop1.setEstimatedMinutesFromStart(10);

        stop2 = new Route.RouteStop();
        stop2.setName("Stop 2");
        stop2.setAddress("456 Oak Ave");
        stop2.setLatitude(40.7580);
        stop2.setLongitude(-73.9855);
        stop2.setEstimatedMinutesFromStart(20);

        route = new Route();
        route.setId(1L);
        route.setName("Test Route");
        route.setDescription("Test Route Description");
        route.setSchool(school);
        route.setType(Route.RouteType.MORNING_PICKUP);
        route.setStatus(Route.RouteStatus.ACTIVE);
        route.setStops(new ArrayList<>(Arrays.asList(stop1, stop2)));

        // Set up default mocks
        when(schoolRepository.findById(1L)).thenReturn(Optional.of(school));
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
    }

    @Test
    void saveRoute_Success() {
        // Arrange
        when(routeRepository.save(any(Route.class))).thenReturn(route);

        // Act
        Route result = routeService.save(route);

        // Assert
        assertNotNull(result);
        assertEquals(school, result.getSchool());
        assertEquals(Route.RouteType.MORNING_PICKUP, result.getType());
        assertEquals(2, result.getStops().size());
        verify(routeRepository).save(route);
    }

    @Test
    void saveRoute_InvalidSchool_ThrowsException() {
        // Arrange
        route.setSchool(null);

        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.save(route));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void saveRoute_InvalidStops_ThrowsException() {
        // Arrange
        route.setStops(new ArrayList<>(Arrays.asList(stop1))); // Only one stop

        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.save(route));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void addStop_WithAddress_Success() {
        // Arrange
        when(routeRepository.save(any(Route.class))).thenReturn(route);

        // Act
        routeService.addStop(1L, "New Stop", "789 Pine St", 40.7128, -74.0060, 3, 30);

        // Assert
        assertEquals(3, route.getStops().size());
        verify(routeRepository).save(route);
    }

    @Test
    void addStop_InvalidRoute_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, 
            () -> routeService.addStop(1L, "New Stop", 40.7128, -74.0060, 3));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void addStop_InvalidSequence_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        // Act & Assert
        assertThrows(ValidationException.class, 
            () -> routeService.addStop(1L, "New Stop", 40.7128, -74.0060, 0));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void addStop_EmptyName_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        // Act & Assert
        assertThrows(ValidationException.class, 
            () -> routeService.addStop(1L, "", 40.7128, -74.0060, 3));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void addStop_NullCoordinates_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        // Act & Assert
        assertThrows(ValidationException.class, 
            () -> routeService.addStop(1L, "New Stop", null, -74.0060, 3));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void updateStop_Success() {
        // Arrange
        when(routeRepository.save(any(Route.class))).thenReturn(route);

        // Act
        routeService.updateStop(1L, 0L, "Updated Stop", 40.7128, -74.0060, 1);

        // Assert
        assertEquals("Updated Stop", route.getStops().get(0).getName());
        verify(routeRepository).save(route);
    }

    @Test
    void updateStop_InvalidRoute_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, 
            () -> routeService.updateStop(1L, 0L, "Updated Stop", 40.7128, -74.0060, 1));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void updateStop_InvalidStop_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        // Act & Assert
        assertThrows(ValidationException.class, 
            () -> routeService.updateStop(1L, 999L, "Updated Stop", 40.7128, -74.0060, 1));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void updateStop_EmptyName_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        // Act & Assert
        assertThrows(ValidationException.class, 
            () -> routeService.updateStop(1L, 0L, "", 40.7128, -74.0060, 1));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void updateStop_NullCoordinates_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        // Act & Assert
        assertThrows(ValidationException.class, 
            () -> routeService.updateStop(1L, 0L, "Updated Stop", null, -74.0060, 1));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void removeStop_InvalidRoute_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> routeService.removeStop(1L, 0L));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void removeStop_InvalidStop_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));

        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.removeStop(1L, 999L));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void removeStop_MinimumStops_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
        route.setStops(Arrays.asList(stop1, stop2)); // Only two stops

        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.removeStop(1L, 0L));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void assignToSchool_Success() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
        when(schoolRepository.findById(1L)).thenReturn(Optional.of(school));
        when(routeRepository.save(any(Route.class))).thenReturn(route);

        // Act
        routeService.assignToSchool(1L, 1L);

        // Assert
        assertEquals(school, route.getSchool());
        verify(routeRepository).save(route);
    }

    @Test
    void assignToSchool_InvalidRoute_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> routeService.assignToSchool(1L, 1L));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void assignToSchool_InvalidSchool_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
        when(schoolRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> routeService.assignToSchool(1L, 1L));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void findBySchoolId_Success() {
        // Arrange
        List<Route> routes = Arrays.asList(route);
        when(routeRepository.findBySchoolIdAndActiveTrue(1L)).thenReturn(routes);

        // Act
        List<Route> result = routeService.findBySchoolId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(route, result.get(0));
        verify(routeRepository).findBySchoolIdAndActiveTrue(1L);
    }

    @Test
    void findBySchoolId_EmptyList() {
        // Arrange
        when(routeRepository.findBySchoolIdAndActiveTrue(1L)).thenReturn(Collections.emptyList());

        // Act
        List<Route> result = routeService.findBySchoolId(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(routeRepository).findBySchoolIdAndActiveTrue(1L);
    }

    @Test
    void findBySchoolId_NullSchoolId_ThrowsException() {
        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.findBySchoolId(null));
        verify(routeRepository, never()).findBySchoolIdAndActiveTrue(any());
    }

    @Test
    void findBySchoolId_InvalidSchool_ThrowsException() {
        // Arrange
        when(schoolRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> routeService.findBySchoolId(999L));
        verify(routeRepository, never()).findBySchoolIdAndActiveTrue(any());
    }

    @Test
    void findByType_Success() {
        // Arrange
        List<Route> expectedRoutes = Arrays.asList(route);
        when(routeRepository.findByTypeAndActiveTrue(Route.RouteType.MORNING_PICKUP))
            .thenReturn(expectedRoutes);

        // Act
        List<Route> result = routeService.findByType(Route.RouteType.MORNING_PICKUP);

        // Assert
        assertEquals(expectedRoutes, result);
        verify(routeRepository).findByTypeAndActiveTrue(Route.RouteType.MORNING_PICKUP);
    }

    @Test
    void findByType_NullType_ThrowsException() {
        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.findByType(null));
        verify(routeRepository, never()).findByTypeAndActiveTrue(any());
    }

    @Test
    void findBySchoolAndType_Success() {
        // Arrange
        List<Route> expectedRoutes = Arrays.asList(route);
        when(routeRepository.findBySchoolAndType(1L, Route.RouteType.MORNING_PICKUP))
            .thenReturn(expectedRoutes);

        // Act
        List<Route> result = routeService.findBySchoolAndType(1L, Route.RouteType.MORNING_PICKUP);

        // Assert
        assertEquals(expectedRoutes, result);
        verify(routeRepository).findBySchoolAndType(1L, Route.RouteType.MORNING_PICKUP);
    }

    @Test
    void reorderStops_Success() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
        when(routeRepository.save(any(Route.class))).thenReturn(route);
        List<Long> newOrder = Arrays.asList(1L, 0L); // Reverse the order

        // Act
        routeService.reorderStops(1L, newOrder);

        // Assert
        assertEquals(stop2, route.getStops().get(0));
        assertEquals(stop1, route.getStops().get(1));
        verify(routeRepository).save(route);
    }

    @Test
    void reorderStops_InvalidRoute_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.empty());
        List<Long> newOrder = Arrays.asList(1L, 0L);

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> routeService.reorderStops(1L, newOrder));
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    void reorderStops_InvalidStopCount_ThrowsException() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
        List<Long> newOrder = Arrays.asList(1L); // Only one stop index

        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.reorderStops(1L, newOrder));
        verify(routeRepository, never()).save(any(Route.class));
    }
} 