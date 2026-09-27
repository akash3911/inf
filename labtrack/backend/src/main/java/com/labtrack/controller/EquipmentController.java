package com.labtrack.controller;

import com.labtrack.entity.Equipment;
import com.labtrack.repository.EquipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentRepository equipment;

    public EquipmentController(EquipmentRepository equipment) {
        this.equipment = equipment;
    }

    @GetMapping
    public List<Equipment> list() {
        return equipment.findAll();
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PostMapping
    public Equipment create(@RequestBody Equipment e) {
        if (e.getStatus() == null) e.setStatus("AVAILABLE");
        return equipment.save(e);
    }

    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return equipment.findById(id).map(e -> {
            if (body.get("name") != null) e.setName(body.get("name"));
            if (body.get("category") != null) e.setCategory(body.get("category"));
            if (body.get("location") != null) e.setLocation(body.get("location"));
            if (body.get("status") != null) e.setStatus(body.get("status"));
            return ResponseEntity.ok(equipment.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        equipment.deleteById(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
