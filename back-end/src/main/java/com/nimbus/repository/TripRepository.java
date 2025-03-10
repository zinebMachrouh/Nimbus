package com.nimbus.repository;

import com.nimbus.model.Route;
import com.nimbus.model.Trip;
import com.nimbus.model.TripStatus;
import com.nimbus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByDriver(User driver);
    List<Trip> findByRoute(Route route);
    List<Trip> findByStatus(TripStatus status);
    List<Trip> findByDriverAndStatus(User driver, TripStatus status);
    List<Trip> findByRouteAndStatus(Route route, TripStatus status);
    List<Trip> findByDateAndStatus(LocalDate date, TripStatus status);
}

