package com.nimbus.repository;

import com.nimbus.model.Attendance;
import com.nimbus.model.Student;
import com.nimbus.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByTrip(Trip trip);
    List<Attendance> findByStudent(Student student);
    Optional<Attendance> findByTripAndStudent(Trip trip, Student student);
    List<Attendance> findByTripAndPresent(Trip trip, boolean present);
}

