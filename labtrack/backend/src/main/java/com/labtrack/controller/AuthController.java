package com.labtrack.controller;

import com.labtrack.entity.User;
import com.labtrack.repository.UserRepository;
import com.labtrack.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository users, PasswordEncoder encoder,
                          AuthenticationManager authManager, JwtUtil jwtUtil) {
        this.users = users;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || password == null) return ResponseEntity.badRequest().body(Map.of("message", "username+password required"));
        if (users.findByUsername(username).isPresent()) return ResponseEntity.badRequest().body(Map.of("message", "username taken"));
        User u = new User();
        u.setUsername(username);
        u.setPassword(encoder.encode(password));
        u.setRole("USER");
        users.save(u);
        return ResponseEntity.ok(Map.of("token", jwtUtil.generate(u.getUsername(), u.getRole()),
                "username", u.getUsername(), "role", u.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(body.get("username"), body.get("password")));
        User u = users.findByUsername(body.get("username")).orElseThrow();
        return ResponseEntity.ok(Map.of("token", jwtUtil.generate(u.getUsername(), u.getRole()),
                "username", u.getUsername(), "role", u.getRole()));
    }
}
