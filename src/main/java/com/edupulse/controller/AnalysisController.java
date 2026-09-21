package com.edupulse.controller;

import com.edupulse.dto.PerformanceAnalysisDTO;
import com.edupulse.service.AnalysisService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<PerformanceAnalysisDTO> getStudentAnalysis(@PathVariable Long studentId) {
        PerformanceAnalysisDTO analysis = analysisService.analyzeStudentPerformance(studentId);
        return ResponseEntity.ok(analysis);
    }
}

