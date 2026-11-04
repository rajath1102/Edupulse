package com.edupulse.controller;

import com.edupulse.dto.CheatSheetRequestDTO;
import com.edupulse.dto.CheatSheetResponseDTO;
import com.edupulse.dto.GradeAnswerRequestDTO;
import com.edupulse.dto.GradeAnswerResponseDTO;
import com.edupulse.service.AnswerGraderService;
import com.edupulse.service.CheatSheetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class ExamPreparationController {

    private final AnswerGraderService graderService;
    private final CheatSheetService cheatSheetService;

    public ExamPreparationController(AnswerGraderService graderService, CheatSheetService cheatSheetService) {
        this.graderService = graderService;
        this.cheatSheetService = cheatSheetService;
    }

    /**
     * POST /api/ai/grade-answer
     * Interactive AI Exam Grader: Evaluates student's answer against university rubrics in real-time.
     */
    @PostMapping("/grade-answer")
    public ResponseEntity<GradeAnswerResponseDTO> gradeStudentAnswer(
            @Valid @RequestBody GradeAnswerRequestDTO request) {
        return ResponseEntity.ok(graderService.gradeAnswer(request));
    }

    /**
     * POST /api/ai/cheat-sheet
     * Generates a 15-minute Last-Night Exam Revision Sheet with definitions, formulas, and pitfalls.
     */
    @PostMapping("/cheat-sheet")
    public ResponseEntity<CheatSheetResponseDTO> generateCheatSheet(
            @Valid @RequestBody CheatSheetRequestDTO request) {
        return ResponseEntity.ok(cheatSheetService.generateCheatSheet(request));
    }
}
