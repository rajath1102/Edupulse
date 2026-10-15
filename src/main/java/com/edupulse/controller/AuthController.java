package com.edupulse.controller;

import com.edupulse.dto.AuthResponseDTO;
import com.edupulse.dto.LoginRequestDTO;
import com.edupulse.dto.RegisterRequestDTO;
import com.edupulse.dto.UserSummaryDTO;
import com.edupulse.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing user registration, login, and profile introspection endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register - Register a new user account (Student, Teacher, or Admin).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/auth/login - Authenticate with username or email and password to receive a JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/me - Retrieve current authenticated user profile summary.
     */
    @GetMapping("/me")
    public ResponseEntity<UserSummaryDTO> getCurrentUser() {
        UserSummaryDTO summary = authService.getCurrentUserSummary();
        return ResponseEntity.ok(summary);
    }
}
