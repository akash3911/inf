package com.labtrack.controller;

import com.labtrack.entity.Booking;
import com.labtrack.entity.Equipment;
import com.labtrack.entity.User;
import com.labtrack.repository.BookingRepository;
import com.labtrack.repository.EquipmentRepository;
import com.labtrack.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookings;
    private final EquipmentRepository equipment;
    private final UserRepository users;

    public BookingController(BookingRepository bookings, EquipmentRepository equipment, UserRepository users) {
        this.bookings = bookings;
        this.equipment = equipment;
        this.users = users;
    }

    // ADMIN sees all, others see own
    @GetMapping
    public List<Booking> list(Authentication auth) {
        User u = users.findByUsername(auth.getName()).orElseThrow();
        if ("ADMIN".equals(u.getRole())) return bookings.findAll();
        return bookings.findByUserId(u.getId());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, Authentication auth) {
        Equipment e = equipment.findById(Long.valueOf(body.get("equipmentId"))).orElse(null);
        if (e == null) return ResponseEntity.badRequest().body(Map.of("message", "equipment not found"));
        if ("UNDER_MAINTENANCE".equals(e.getStatus()) || "RETIRED".equals(e.getStatus()))
            return ResponseEntity.badRequest().body(Map.of("message", "equipment not available: " + e.getStatus()));
        LocalDateTime start = LocalDateTime.parse(body.get("startTime"));
        LocalDateTime end = LocalDateTime.parse(body.get("endTime"));
        if (!end.isAfter(start)) return ResponseEntity.badRequest().body(Map.of("message", "end must be after start"));
        if (!bookings.findOverlapping(e.getId(), start, end).isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "slot already booked"));
        Booking b = new Booking();
        b.setEquipment(e);
        b.setUser(users.findByUsername(auth.getName()).orElseThrow());
        b.setStartTime(start);
        b.setEndTime(end);
        b.setStatus("BOOKED");
        return ResponseEntity.ok(bookings.save(b));
    }

    // cancel own booking, or any if ADMIN
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        Booking b = bookings.findById(id).orElse(null);
        if (b == null) return ResponseEntity.notFound().build();
        User u = users.findByUsername(auth.getName()).orElseThrow();
        if (!b.getUser().getId().equals(u.getId()) && !"ADMIN".equals(u.getRole()))
            return ResponseEntity.status(403).body(Map.of("message", "not allowed"));
        b.setStatus("CANCELLED");
        return ResponseEntity.ok(bookings.save(b));
    }
}
