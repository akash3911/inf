package com.labtrack.controller;

import com.labtrack.entity.Booking;
import com.labtrack.entity.Equipment;
import com.labtrack.repository.BookingRepository;
import com.labtrack.repository.EquipmentRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyRole('ADMIN','STAFF')")
public class AnalyticsController {

    private final BookingRepository bookings;
    private final EquipmentRepository equipment;

    public AnalyticsController(BookingRepository bookings, EquipmentRepository equipment) {
        this.bookings = bookings;
        this.equipment = equipment;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "OK");
    }

    // utilization % per equipment = booked hours inside [from,to] / total hours in range
    @GetMapping("/utilization")
    public List<Map<String, Object>> utilization(
            @RequestParam String from, @RequestParam String to) {
        LocalDateTime rangeStart = LocalDateTime.parse(from);
        LocalDateTime rangeEnd = LocalDateTime.parse(to);
        double rangeHours = Math.max(Duration.between(rangeStart, rangeEnd).toMinutes() / 60.0, 1.0);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Equipment e : equipment.findAll()) {
            double bookedHours = 0;
            int bookingCount = 0;
            for (Booking b : bookings.findByStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                    "BOOKED", rangeEnd, rangeStart)) {
                if (!b.getEquipment().getId().equals(e.getId())) continue;
                LocalDateTime s = b.getStartTime().isBefore(rangeStart) ? rangeStart : b.getStartTime();
                LocalDateTime en = b.getEndTime().isAfter(rangeEnd) ? rangeEnd : b.getEndTime();
                if (en.isAfter(s)) {
                    bookedHours += Duration.between(s, en).toMinutes() / 60.0;
                    bookingCount++;
                }
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("equipmentId", e.getId());
            row.put("equipmentName", e.getName());
            row.put("bookingCount", bookingCount);
            row.put("bookedHours", Math.round(bookedHours * 100.0) / 100.0);
            row.put("utilizationPct", Math.round(bookedHours / rangeHours * 10000.0) / 100.0);
            out.add(row);
        }
        out.sort((a, b) -> Double.compare((Double) b.get("utilizationPct"), (Double) a.get("utilizationPct")));
        return out;
    }
}
