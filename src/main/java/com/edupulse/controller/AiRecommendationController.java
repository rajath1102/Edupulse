package com.edupulse.controller;

import com.edupulse.dto.AiRecommendationResponseDTO;
import com.edupulse.model.Role;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.AiRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<AiRecommendationResponseDTO> getRecommendation(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null && currentUser.getRole() == Role.ROLE_STUDENT) {
            if (currentUser.getStudentId() == null || !currentUser.getStudentId().equals(studentId)) {
                throw new AccessDeniedException("Access Denied: Students are only permitted to access their own AI study plans.");
            }
        }
        AiRecommendationResponseDTO response = aiRecommendationService.generateRecommendation(studentId);
        return ResponseEntity.ok(response);
    }
}

