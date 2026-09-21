package com.edupulse.controller;

import com.edupulse.dto.AiRecommendationResponseDTO;
import com.edupulse.service.AiRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing AI-powered personalized recommendation endpoints.
 */
@RestController
@RequestMapping("/api/ai")
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    public AiRecommendationController(AiRecommendationService aiRecommendationService) {
        this.aiRecommendationService = aiRecommendationService;
    }

    /**
     * POST /api/ai/recommendation/{studentId} - Generate AI study plan and recommendation
     */
    @PostMapping("/recommendation/{studentId}")
    public ResponseEntity<AiRecommendationResponseDTO> getRecommendation(@PathVariable Long studentId) {
        AiRecommendationResponseDTO response = aiRecommendationService.generateRecommendation(studentId);
        return ResponseEntity.ok(response);
    }
}

