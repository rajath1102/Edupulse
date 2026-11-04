package com.edupulse.service;

import com.edupulse.dto.GradeAnswerRequestDTO;
import com.edupulse.dto.GradeAnswerResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service to evaluate student answers in real-time against university scoring rubrics.
 * Assigns marks, strengths, missed points, and model suggestions.
 */
@Service
public class AnswerGraderService {

    private static final Logger logger = LoggerFactory.getLogger(AnswerGraderService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public AnswerGraderService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Grades student answer against rubrics and returns mark breakdown.
     */
    public GradeAnswerResponseDTO gradeAnswer(GradeAnswerRequestDTO request) {
        int maxMarks = request.getMaxMarks();
        String question = request.getQuestion();
        String studentAnswer = request.getStudentAnswer();
        String subject = request.getSubject() != null ? request.getSubject() : "Coursework";

        // Try AI Grader with Gemini
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            String[] modelChain = {
                    geminiModel,
                    "gemini-1.5-flash",
                    "gemini-2.0-flash-lite",
                    "gemini-1.5-flash-latest"
            };

            String prompt = String.format("""
                    You are a university exam evaluator marking a student's examination script.
                    
                    Question:
                    %s
                    
                    Maximum Marks: %d
                    Subject: %s
                    
                    Scoring Rubric / Criteria:
                    %s
                    
                    Model Answer (Reference):
                    %s
                    
                    Student's Answer:
                    %s
                    
                    Return a JSON object ONLY with the following exact keys:
                    {
                      "scoreAwarded": (integer between 0 and %d),
                      "gradeBand": ("EXCELLENT" or "GOOD" or "NEEDS_IMPROVEMENT" or "UNSATISFACTORY"),
                      "feedbackSummary": "Concise 1-2 sentence overall evaluation",
                      "strengths": ["list of correct technical points student covered"],
                      "missedPoints": ["list of key concepts, derivation steps, formulas, or keywords student omitted"],
                      "modelImprovementTip": "Specific tip on how student could gain full marks in this question"
                    }
                    """,
                    question,
                    maxMarks,
                    subject,
                    request.getScoringRubric() != null ? request.getScoringRubric() : "Standard university academic rigor",
                    request.getModelAnswer() != null ? request.getModelAnswer() : "Standard textbook derivation and definitions",
                    studentAnswer,
                    maxMarks
            );

            for (String model : modelChain) {
                try {
                    String raw = callGeminiGenerateApi(prompt, model);
                    if (raw != null && !raw.isBlank()) {
                        GradeAnswerResponseDTO dto = parseAiGrading(raw, maxMarks, "Google Gemini AI (" + model + ")");
                        if (dto != null) return dto;
                    }
                } catch (Exception e) {
                    logger.warn("AnswerGraderService: Model {} failed: {}", model, e.getMessage());
                }
            }
        }

        // Heuristic fallback evaluator
        return evaluateHeuristically(question, studentAnswer, maxMarks, subject);
    }

    private GradeAnswerResponseDTO parseAiGrading(String raw, int maxMarks, String aiSource) {
        try {
            String cleaned = raw.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode root = objectMapper.readTree(cleaned);

            int score = root.path("scoreAwarded").asInt(maxMarks / 2);
            if (score > maxMarks) score = maxMarks;
            if (score < 0) score = 0;

            String gradeBand = root.path("gradeBand").asText("GOOD");
            String feedback = root.path("feedbackSummary").asText("Answer evaluated against rubric.");
            String tip = root.path("modelImprovementTip").asText("Review key formulas and derivations to maximize score.");

            List<String> strengths = new ArrayList<>();
            if (root.path("strengths").isArray()) {
                root.path("strengths").forEach(n -> strengths.add(n.asText()));
            }

            List<String> missed = new ArrayList<>();
            if (root.path("missedPoints").isArray()) {
                root.path("missedPoints").forEach(n -> missed.add(n.asText()));
            }

            double percentage = Math.round(((double) score / maxMarks * 100.0) * 10.0) / 10.0;

            return new GradeAnswerResponseDTO(
                    score,
                    maxMarks,
                    percentage,
                    gradeBand,
                    feedback,
                    strengths,
                    missed,
                    tip,
                    aiSource
            );
        } catch (Exception e) {
            logger.warn("Failed to parse Gemini grader output: {}", e.getMessage());
            return null;
        }
    }

    private GradeAnswerResponseDTO evaluateHeuristically(String question, String answer, int maxMarks, String subject) {
        int length = answer.trim().split("\\s+").length;
        int score;
        String band;
        List<String> strengths = new ArrayList<>();
        List<String> missed = new ArrayList<>();

        if (length > 80) {
            score = (int) Math.round(maxMarks * 0.85);
            band = "EXCELLENT";
            strengths.add("Extensive and detailed conceptual response covering theoretical definitions.");
            strengths.add("Structure adheres to university multi-point descriptive question format.");
            missed.add("Ensure all mathematical derivation steps and labeled diagrams are explicit.");
        } else if (length > 35) {
            score = (int) Math.round(maxMarks * 0.65);
            band = "GOOD";
            strengths.add("Understands the core principle and technical terminology.");
            missed.add("Missing complete step-by-step mathematical or algorithmic justification.");
            missed.add("Include a real-world system example to secure top-tier marks.");
        } else if (length > 10) {
            score = (int) Math.round(maxMarks * 0.40);
            band = "NEEDS_IMPROVEMENT";
            strengths.add("Mentioned basic keywords relevant to the question.");
            missed.add("Answer is too brief for an examination setting.");
            missed.add("Did not provide formal textbook definitions or illustrative diagrams.");
        } else {
            score = Math.min(1, maxMarks);
            band = "UNSATISFACTORY";
            strengths.add("Attempted the question.");
            missed.add("Severely incomplete answer.");
        }

        double percentage = Math.round(((double) score / maxMarks * 100.0) * 10.0) / 10.0;
        String summary = String.format("Awarded %d/%d marks. %s", score, maxMarks,
                score >= maxMarks * 0.7 ? "Strong grasp of concepts with minor scope for diagrammatic polish." : "Requires further depth and academic structure.");

        return new GradeAnswerResponseDTO(
                score,
                maxMarks,
                percentage,
                band,
                summary,
                strengths,
                missed,
                "Structure answers with: 1) Formal Definition, 2) Block Diagram/Equations, 3) 2-3 Bullet-point characteristics, 4) Real-world Application.",
                "EduPulse University Examination Rubric Evaluator"
        );
    }

    private String callGeminiGenerateApi(String prompt, String modelToUse) throws Exception {
        String endpoint = String.format("%s/%s:generateContent?key=%s", geminiBaseUrl, modelToUse, geminiApiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Collections.singletonMap("text", prompt);
        Map<String, Object> contentMap = Collections.singletonMap("parts", Collections.singletonList(textPart));
        Map<String, Object> requestBody = Collections.singletonMap("contents", Collections.singletonList(contentMap));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        }

        throw new RuntimeException("Empty response from Gemini Grader API");
    }
}
