package com.edupulse.controller;

import com.edupulse.dto.PerformanceRequestDTO;
import com.edupulse.dto.PerformanceResponseDTO;
import com.edupulse.model.Role;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.PerformanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller exposing endpoints for Student Performance logging and tracking.
 */
@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    /**
     * POST /api/performance - Log a performance record for a student
     */
    @PostMapping
    public ResponseEntity<PerformanceResponseDTO> addPerformance(@Valid @RequestBody PerformanceRequestDTO dto) {
        PerformanceResponseDTO response = performanceService.addPerformance(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/performance/student/{studentId} - Log a performance record for a specific student ID
     */
    @PostMapping("/student/{studentId}")
    public ResponseEntity<PerformanceResponseDTO> addPerformanceForStudent(
            @PathVariable Long studentId,
            @RequestBody PerformanceRequestDTO dto) {
        dto.setStudentId(studentId);
        PerformanceResponseDTO response = performanceService.addPerformance(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/performance/batch - Batch log multiple performance records
     */
    @PostMapping("/batch")
    public ResponseEntity<List<PerformanceResponseDTO>> addBatchPerformance(
            @Valid @RequestBody List<PerformanceRequestDTO> dtos) {
        List<PerformanceResponseDTO> responses = performanceService.addBatchPerformance(dtos);
        return new ResponseEntity<>(responses, HttpStatus.CREATED);
    }

    /**
     * GET /api/performance/student/{studentId} - Get all performance records for a student
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PerformanceResponseDTO>> getPerformanceByStudentId(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null && currentUser.getRole() == Role.ROLE_STUDENT) {
            if (currentUser.getStudentId() == null || !currentUser.getStudentId().equals(studentId)) {
                throw new AccessDeniedException("Access Denied: Students are only permitted to access their own performance records.");
            }
        }
        List<PerformanceResponseDTO> list = performanceService.getPerformancesByStudentId(studentId);
        return ResponseEntity.ok(list);
    }
}

