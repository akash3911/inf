package com.labtrack.controller;

import com.labtrack.entity.Equipment;
import com.labtrack.entity.Maintenance;
import com.labtrack.repository.EquipmentRepository;
import com.labtrack.repository.MaintenanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceRepository maintenance;
    private final EquipmentRepository equipment;

    public MaintenanceController(MaintenanceRepository maintenance, EquipmentRepository equipment) {
        this.maintenance = maintenance;
        this.equipment = equipment;
    }

    @GetMapping
    public List<Maintenance> list(@RequestParam(required = false) String status) {
        if (status != null) return maintenance.findByStatus(status);
        return maintenance.findAll();
    }

    // any logged-in user can report an issue
    @PostMapping
    public ResponseEntity<?> report(@RequestBody Map<String, String> body, Authentication auth) {
        Equipment e = equipment.findById(Long.valueOf(body.get("equipmentId"))).orElse(null);
        if (e == null) return ResponseEntity.badRequest().body(Map.of("message", "equipment not found"));
        Maintenance m = new Maintenance();
        m.setEquipment(e);
        m.setReportedBy(auth.getName());
        m.setDescription(body.get("description"));
        m.setStatus("OPEN");
        e.setStatus("UNDER_MAINTENANCE"); // block new bookings until resolved
        equipment.save(e);
        return ResponseEntity.ok(maintenance.save(m));
    }

    // STAFF/ADMIN track progress; resolving frees the equipment
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PutMapping("/{id}/status")
    public ResponseEntity<?> setStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Maintenance m = maintenance.findById(id).orElse(null);
        if (m == null) return ResponseEntity.notFound().build();
        m.setStatus(body.get("status"));
        if ("RESOLVED".equals(body.get("status"))) {
            Equipment e = m.getEquipment();
            e.setStatus("AVAILABLE");
            equipment.save(e);
        }
        return ResponseEntity.ok(maintenance.save(m));
    }
}
