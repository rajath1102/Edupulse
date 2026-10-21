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
    @PostMapping({"/recommendation/{studentId}", "/recommendations/{studentId}"})
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

    /**
     * POST /api/ai/scan-marks - Optical exam & mark sheet scanner using Gemini Vision
     */
    @PostMapping("/scan-marks")
    public ResponseEntity<com.edupulse.dto.ScanMarksResponseDTO> scanMarks(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.edupulse.dto.ScanMarksRequestDTO request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null && currentUser.getRole() == Role.ROLE_STUDENT) {
            throw new AccessDeniedException("Access Denied: Only teachers and administrators can scan exam sheets.");
        }
        com.edupulse.dto.ScanMarksResponseDTO response = aiRecommendationService.scanExamSheet(request.getImageBase64(), request.getMimeType());
        return ResponseEntity.ok(response);
    }
}

