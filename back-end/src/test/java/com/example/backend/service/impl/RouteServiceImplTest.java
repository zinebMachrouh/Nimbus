package com.example.backend.service.impl;

import com.example.backend.entities.Route;
import com.example.backend.entities.School;
import com.example.backend.exception.EntityNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.SchoolRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RouteServiceImplTest {

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private RouteServiceImpl routeService;

    private Route testRoute;
    private School testSchool;
    private List<Route.RouteStop> testStops;

    @BeforeEach
    void setUp() {
        // Create a test school
        testSchool = new School();
        testSchool.setId(1L);
        testSchool.setName("Test School");

        // Create test stops
        testStops = new ArrayList<>();
        Route.RouteStop stop1 = new Route.RouteStop("Stop 1", "123 Main St", 37.7749, -122.4194, 0);
        Route.RouteStop stop2 = new Route.RouteStop("Stop 2", "456 Oak St", 37.7750, -122.4184, 5);
        testStops.add(stop1);
        testStops.add(stop2);

        // Create a test route
        testRoute = new Route();
        testRoute.setId(1L);
        testRoute.setName("Test Route");
        testRoute.setDescription("Test Description");
        testRoute.setType(Route.RouteType.MORNING_PICKUP);
        testRoute.setStatus(Route.RouteStatus.ACTIVE);
        testRoute.setSchool(testSchool);
        testRoute.setStops(testStops);
    }

    @Test
    @DisplayName("Should find all routes")
    void testFindAll() {
        // Arrange
        List<Route> expectedRoutes = Arrays.asList(testRoute);
        when(routeRepository.findAll()).thenReturn(expectedRoutes);

        // Act
        List<Route> actualRoutes = routeService.findAll();

        // Assert
        assertEquals(expectedRoutes, actualRoutes);
        verify(routeRepository).findAll();
    }

    @Test
    @DisplayName("Should find route by ID")
    void testFindById() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(testRoute));

        // Act
        Route actualRoute = routeService.findById(1L);

        // Assert
        assertEquals(testRoute, actualRoute);
        verify(routeRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when route not found")
    void testFindByIdNotFound() {
        // Arrange
        when(routeRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> routeService.findById(999L));
        verify(routeRepository).findById(999L);
    }

    @Test
    @DisplayName("Should save route")
    void testSave() {
        // Arrange
        when(routeRepository.save(any(Route.class))).thenReturn(testRoute);

        // Act
        Route savedRoute = routeService.save(testRoute);

        // Assert
        assertEquals(testRoute, savedRoute);
        verify(routeRepository).save(testRoute);
    }

    @Test
    @DisplayName("Should delete route by ID")
    void testDeleteById() {
        // Act
        routeService.deleteById(1L);

        // Assert
        verify(routeRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should find routes by school ID")
    void testFindBySchoolId() {
        // Arrange
        List<Route> expectedRoutes = Arrays.asList(testRoute);
        when(schoolRepository.existsById(1L)).thenReturn(true);
        when(routeRepository.findBySchoolIdAndActiveTrue(1L)).thenReturn(expectedRoutes);

        // Act
        List<Route> actualRoutes = routeService.findBySchoolId(1L);

        // Assert
        assertEquals(expectedRoutes, actualRoutes);
        verify(schoolRepository).existsById(1L);
        verify(routeRepository).findBySchoolIdAndActiveTrue(1L);
    }

    @Test
    @DisplayName("Should throw exception when school not found")
    void testFindBySchoolIdNotFound() {
        // Arrange
        when(schoolRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> routeService.findBySchoolId(999L));
        verify(schoolRepository).existsById(999L);
        verify(routeRepository, never()).findBySchoolIdAndActiveTrue(anyLong());
    }

    @Test
    @DisplayName("Should find routes by type")
    void testFindByType() {
        // Arrange
        List<Route> expectedRoutes = Arrays.asList(testRoute);
        when(routeRepository.findByTypeAndActiveTrue(Route.RouteType.MORNING_PICKUP)).thenReturn(expectedRoutes);

        // Act
        List<Route> actualRoutes = routeService.findByType(Route.RouteType.MORNING_PICKUP);

        // Assert
        assertEquals(expectedRoutes, actualRoutes);
        verify(routeRepository).findByTypeAndActiveTrue(Route.RouteType.MORNING_PICKUP);
    }

    @Test
    @DisplayName("Should throw exception when route type is null")
    void testFindByTypeNull() {
        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.findByType(null));
        verify(routeRepository, never()).findByTypeAndActiveTrue(any());
    }

    @Test
    @DisplayName("Should find route by ID with stops")
    void testFindByIdWithStops() {
        // Arrange
        when(routeRepository.findByIdWithStops(1L)).thenReturn(Optional.of(testRoute));

        // Act
        Optional<Route> actualRoute = routeService.findByIdWithStops(1L);

        // Assert
        assertTrue(actualRoute.isPresent());
        assertEquals(testRoute, actualRoute.get());
        verify(routeRepository).findByIdWithStops(1L);
    }

    @Test
    @DisplayName("Should find routes by school and type")
    void testFindBySchoolAndType() {
        // Arrange
        List<Route> expectedRoutes = Arrays.asList(testRoute);
        when(routeRepository.findBySchoolAndType(1L, Route.RouteType.MORNING_PICKUP)).thenReturn(expectedRoutes);

        // Act
        List<Route> actualRoutes = routeService.findBySchoolAndType(1L, Route.RouteType.MORNING_PICKUP);

        // Assert
        assertEquals(expectedRoutes, actualRoutes);
        verify(routeRepository).findBySchoolAndType(1L, Route.RouteType.MORNING_PICKUP);
    }

    @Test
    @DisplayName("Should add stop to route")
    void testAddStop() {
        // Arrange
        Route routeWithStops = new Route();
        routeWithStops.setId(1L);
        routeWithStops.setName("Route with stops");
        routeWithStops.setStops(new ArrayList<>(testStops));

        when(routeRepository.findById(1L)).thenReturn(Optional.of(routeWithStops));
        when(routeRepository.save(any(Route.class))).thenReturn(routeWithStops);

        // Act
        routeService.addStop(1L, "New Stop", "789 Pine St", 37.7751, -122.4174, 3, 10);

        // Assert
        verify(routeRepository).findById(1L);
        verify(routeRepository).save(routeWithStops);
        assertEquals(3, routeWithStops.getStops().size());
        assertEquals("New Stop", routeWithStops.getStops().get(2).getName());
        assertEquals("789 Pine St", routeWithStops.getStops().get(2).getAddress());
        assertEquals(37.7751, routeWithStops.getStops().get(2).getLatitude());
        assertEquals(-122.4174, routeWithStops.getStops().get(2).getLongitude());
        assertEquals(10, routeWithStops.getStops().get(2).getEstimatedMinutesFromStart());
    }

    @Test
    @DisplayName("Should throw exception when adding stop with invalid name")
    void testAddStopInvalidName() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(testRoute));

        // Act & Assert
        assertThrows(ValidationException.class, () -> 
            routeService.addStop(1L, "", "789 Pine St", 37.7751, -122.4174, 3, 10)
        );
        verify(routeRepository).findById(1L);
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    @DisplayName("Should throw exception when adding stop with null coordinates")
    void testAddStopNullCoordinates() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(testRoute));

        // Act & Assert
        assertThrows(ValidationException.class, () -> 
            routeService.addStop(1L, "New Stop", "789 Pine St", null, -122.4174, 3, 10)
        );
        verify(routeRepository).findById(1L);
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    @DisplayName("Should remove stop from route")
    void testRemoveStop() {
        // Arrange
        Route routeWithStops = new Route();
        routeWithStops.setId(1L);
        routeWithStops.setName("Route with stops");
        
        // Need at least 3 stops for removal (MINIMUM_STOPS = 2)
        List<Route.RouteStop> stops = new ArrayList<>(testStops);
        stops.add(new Route.RouteStop("Stop 3", "789 Pine St", 37.7751, -122.4174, 10));
        routeWithStops.setStops(stops);

        when(routeRepository.findById(1L)).thenReturn(Optional.of(routeWithStops));
        when(routeRepository.save(any(Route.class))).thenReturn(routeWithStops);

        // Act
        routeService.removeStop(1L, 2L);

        // Assert
        verify(routeRepository).findById(1L);
        verify(routeRepository).save(routeWithStops);
        assertEquals(2, routeWithStops.getStops().size());
    }

    @Test
    @DisplayName("Should throw exception when removing stop would result in too few stops")
    void testRemoveStopTooFewStops() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(testRoute));

        // Act & Assert
        assertThrows(ValidationException.class, () -> routeService.removeStop(1L, 1L));
        verify(routeRepository).findById(1L);
        verify(routeRepository, never()).save(any(Route.class));
    }

    @Test
    @DisplayName("Should assign route to school")
    void testAssignToSchool() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(testRoute));
        when(schoolRepository.findById(2L)).thenReturn(Optional.of(new School()));
        when(routeRepository.save(any(Route.class))).thenReturn(testRoute);

        // Act
        routeService.assignToSchool(1L, 2L);

        // Assert
        verify(routeRepository).findById(1L);
        verify(schoolRepository).findById(2L);
        verify(routeRepository).save(testRoute);
    }

    @Test
    @DisplayName("Should remove route from school")
    void testRemoveFromSchool() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(testRoute));
        when(routeRepository.save(any(Route.class))).thenReturn(testRoute);

        // Act
        routeService.removeFromSchool(1L);

        // Assert
        verify(routeRepository).findById(1L);
        verify(routeRepository).save(testRoute);
        assertNull(testRoute.getSchool());
    }

    @Test
    @DisplayName("Should calculate route distance")
    void testCalculateRouteDistance() {
        // Arrange
        when(routeRepository.findById(1L)).thenReturn(Optional.of(testRoute));

        // Act
        double distance = routeService.calculateRouteDistance(1L);

        // Assert
        verify(routeRepository).findById(1L);
        assertTrue(distance > 0);
    }
} 