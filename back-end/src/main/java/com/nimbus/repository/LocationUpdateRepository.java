package com.nimbus.repository;

import com.nimbus.model.LocationUpdate;
import com.nimbus.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface LocationUpdateRepository extends JpaRepository<LocationUpdate, Long> {
    List<LocationUpdate> findByTripOrderByTimestampDesc(Trip trip);
    LocationUpdate findFirstByTripOrderByTimestampDesc(Trip trip);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM LocationUpdate l WHERE l.timestamp < ?1")
    int deleteByTimestampBefore(long timestamp);
}

