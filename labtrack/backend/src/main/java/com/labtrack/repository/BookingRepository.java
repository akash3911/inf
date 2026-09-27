package com.labtrack.repository;

import com.labtrack.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    // overlapping BOOKED slots for same equipment: existing.start < new.end AND existing.end > new.start
    @Query("SELECT b FROM Booking b WHERE b.equipment.id = :equipmentId AND b.status = 'BOOKED'"
         + " AND b.startTime < :end AND b.endTime > :start")
    List<Booking> findOverlapping(Long equipmentId, LocalDateTime start, LocalDateTime end);

    List<Booking> findByStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            String status, LocalDateTime rangeEnd, LocalDateTime rangeStart);
}
