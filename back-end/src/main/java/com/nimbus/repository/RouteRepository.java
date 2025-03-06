package com.nimbus.repository;

import com.nimbus.model.Route;
import com.nimbus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByDriver(User driver);
    List<Route> findByActive(boolean active);
}

