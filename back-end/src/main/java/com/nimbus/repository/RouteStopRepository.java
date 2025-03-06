package com.nimbus.repository;

import com.nimbus.model.Route;
import com.nimbus.model.RouteStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {
    List<RouteStop> findByRouteOrderByStopOrder(Route route);
}

