package com.labtrack.controller;

import com.labtrack.entity.User;
import com.labtrack.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return users.findAll().stream().map(u -> Map.<String, Object>of(
                "id", u.getId(), "username", u.getUsername(), "role", u.getRole())).toList();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> setRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (!List.of("ADMIN", "STAFF", "USER").contains(role))
            return ResponseEntity.badRequest().body(Map.of("message", "invalid role"));
        return users.findById(id).map(u -> {
            u.setRole(role);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "id", u.getId(), "username", u.getUsername(), "role", users.save(u).getRole()));
        }).orElse(ResponseEntity.notFound().build());
    }
}
