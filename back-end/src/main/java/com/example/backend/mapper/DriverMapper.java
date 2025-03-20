package com.example.backend.mapper;

import com.example.backend.dto.user.DriverDTO;
import com.example.backend.entities.Trip;
import com.example.backend.entities.user.Driver;
import org.mapstruct.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {UserMapper.class})
public interface DriverMapper {
    
    @Mapping(target = "currentVehicleId", source = "currentVehicle.id")
    @Mapping(target = "currentVehicleNumber", source = "currentVehicle.vehicleNumber")
    @Mapping(target = "upcomingTrips", expression = "java(mapUpcomingTrips(entity.getTrips()))")
    @Mapping(target = "currentTrip", expression = "java(findCurrentTrip(entity.getTrips()))")
    DriverDTO toDto(Driver entity);

    @InheritConfiguration(name = "toDto")
    void updateEntity(DriverDTO dto, @MappingTarget Driver entity);

    @InheritInverseConfiguration(name = "toDto")
    @Mapping(target = "trips", ignore = true)
    @Mapping(target = "currentVehicle", ignore = true)
    Driver toEntity(DriverDTO dto);

    default List<DriverDTO.TripSummary> mapUpcomingTrips(List<Trip> trips) {
        if (trips == null) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return trips.stream()
                .filter(trip -> trip.getStatus() == Trip.TripStatus.SCHEDULED)
                .map(trip -> {
                    DriverDTO.TripSummary summary = new DriverDTO.TripSummary();
                    summary.setTripId(trip.getId());
                    summary.setRouteName(trip.getRoute().getName());
                    summary.setScheduledDepartureTime(trip.getScheduledDepartureTime().format(formatter));
                    summary.setTotalStudents(trip.getAttendances().size());
                    summary.setStatus(trip.getStatus().toString());
                    return summary;
                })
                .collect(Collectors.toList());
    }

    default DriverDTO.TripSummary findCurrentTrip(List<Trip> trips) {
        if (trips == null) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return trips.stream()
                .filter(trip -> trip.getStatus() == Trip.TripStatus.IN_PROGRESS)
                .findFirst()
                .map(trip -> {
                    DriverDTO.TripSummary summary = new DriverDTO.TripSummary();
                    summary.setTripId(trip.getId());
                    summary.setRouteName(trip.getRoute().getName());
                    summary.setScheduledDepartureTime(trip.getScheduledDepartureTime().format(formatter));
                    summary.setTotalStudents(trip.getAttendances().size());
                    summary.setStatus(trip.getStatus().toString());
                    return summary;
                })
                .orElse(null);
    }
} 