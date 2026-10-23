package com.edupulse.controller;

import com.edupulse.dto.MockExamRequestDTO;
import com.edupulse.dto.MockExamResponseDTO;
import com.edupulse.service.MockExamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/mock-exam")
public class MockExamController {

    private final MockExamService mockExamService;

    public MockExamController(MockExamService mockExamService) {
        this.mockExamService = mockExamService;
    }

    /**
     * POST /api/ai/mock-exam/generate
     * Generate a university-standard Mock Exam Paper with Model Answer Key and Rubric.
     */
    @PostMapping("/generate")
    public ResponseEntity<MockExamResponseDTO> generateMockExam(
            @Valid @RequestBody MockExamRequestDTO request) {
        return ResponseEntity.ok(mockExamService.generateMockExam(request));
    }
}
