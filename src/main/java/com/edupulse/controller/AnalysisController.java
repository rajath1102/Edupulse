package com.edupulse.controller;

import com.edupulse.dto.PerformanceAnalysisDTO;
import com.edupulse.model.Role;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing analytics and risk computation endpoints.
 */
@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /**
     * GET /api/analysis/student/{studentId} - Compute and retrieve performance analytics
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<PerformanceAnalysisDTO> getStudentAnalysis(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null && currentUser.getRole() == Role.ROLE_STUDENT) {
            if (currentUser.getStudentId() == null || !currentUser.getStudentId().equals(studentId)) {
                throw new AccessDeniedException("Access Denied: Students are only permitted to access their own academic records.");
            }
        }
        PerformanceAnalysisDTO analysis = analysisService.analyzeStudentPerformance(studentId);
        return ResponseEntity.ok(analysis);
    }
}

