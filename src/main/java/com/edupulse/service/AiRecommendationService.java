package com.edupulse.service;

import com.edupulse.dto.AiRecommendationResponseDTO;
import com.edupulse.dto.PerformanceAnalysisDTO;
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

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service to generate personalized AI recommendations and study plans using Google Gemini API.
 * Gracefully falls back to a rule-based advisor if GEMINI_API_KEY is not configured or unavailable.
 */
@Service
public class AiRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(AiRecommendationService.class);

    private final AnalysisService analysisService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public AiRecommendationService(AnalysisService analysisService, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.analysisService = analysisService;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate an AI-powered personalized study recommendation for a student.
     */
    public AiRecommendationResponseDTO generateRecommendation(Long studentId) {
        // Step 1: Fetch performance analysis
        PerformanceAnalysisDTO analysis = analysisService.analyzeStudentPerformance(studentId);

        // Step 2: Check if Gemini API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equalsIgnoreCase("your_api_key_here")) {
            logger.info("GEMINI_API_KEY is not configured. Generating rule-based study recommendation for student ID: {}", studentId);
            String fallbackPlan = generateRuleBasedStudyPlan(analysis);
            return new AiRecommendationResponseDTO(
                    analysis.getStudentId(),
                    analysis.getStudentName(),
                    analysis.getRiskLevel(),
                    analysis.getAverageMarks(),
                    analysis.getAverageAttendance(),
                    analysis.getWeakSubjects(),
                    fallbackPlan,
                    "Rule-Based Adaptive Advisor (Set GEMINI_API_KEY environment variable for Gemini AI)"
            );
        }

        // Step 3: Call Gemini API
        try {
            String prompt = buildPrompt(analysis);
            String aiRecommendation = callGeminiApi(prompt);

            return new AiRecommendationResponseDTO(
                    analysis.getStudentId(),
                    analysis.getStudentName(),
                    analysis.getRiskLevel(),
                    analysis.getAverageMarks(),
                    analysis.getAverageAttendance(),
                    analysis.getWeakSubjects(),
                    aiRecommendation,
                    "Google Gemini AI (" + geminiModel + ")"
            );
        } catch (Exception ex) {
            logger.error("Error communicating with Gemini API: {}. Falling back to rule-based recommendation.", ex.getMessage());
            String fallbackPlan = generateRuleBasedStudyPlan(analysis) +
                    "\n\n[Note: Real-time Gemini API call failed (" + ex.getMessage() + "). Displaying local adaptive recommendation.]";

            return new AiRecommendationResponseDTO(
                    analysis.getStudentId(),
                    analysis.getStudentName(),
                    analysis.getRiskLevel(),
                    analysis.getAverageMarks(),
                    analysis.getAverageAttendance(),
                    analysis.getWeakSubjects(),
                    fallbackPlan,
                    "Rule-Based Adaptive Advisor (Gemini API fallback)"
            );
        }
    }

    /**
     * Constructs a structured prompt for Gemini based on student analytics.
     */
    private String buildPrompt(PerformanceAnalysisDTO analysis) {
        String weakSubjectsStr = analysis.getWeakSubjects().isEmpty()
                ? "None (all subjects >= 50 marks)"
                : String.join(", ", analysis.getWeakSubjects());

        return String.format("""
                You are an expert academic advisor and personalized learning tutor for an educational platform called EduPulse.
                Please generate a concise, highly actionable, and encouraging personalized study plan for the following student:
                
                - Student Name: %s
                - Average Marks: %.2f / 100
                - Weak Subjects (Marks < 50): %s
                - Average Attendance: %.2f%%
                - Risk Level: %s
                - Total Subjects Evaluated: %d
                
                Please structure your recommendation with:
                1. Academic Assessment Summary
                2. Immediate Focus Areas (Targeting weak subjects if any)
                3. Weekly Study & Revision Routine
                4. Attendance & Classroom Engagement Advice
                5. Motivational Advice for College Placement Success
                
                Keep the tone motivating, realistic, and structured.
                """,
                analysis.getStudentName(),
                analysis.getAverageMarks(),
                weakSubjectsStr,
                analysis.getAverageAttendance(),
                analysis.getRiskLevel(),
                analysis.getTotalSubjects()
        );
    }

    /**
     * Executes HTTP POST request to Google Gemini API and extracts generated text.
     */
    private String callGeminiApi(String prompt) throws Exception {
        String endpoint = String.format("%s/%s:generateContent?key=%s", geminiBaseUrl, geminiModel, geminiApiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build Gemini Request Payload: { "contents": [ { "parts": [ { "text": prompt } ] } ] }
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

        throw new RuntimeException("Empty or unrecognized response structure from Gemini API");
    }

    /**
     * Rule-based study plan generator used when GEMINI_API_KEY is not configured or unreachable.
     */
    private String generateRuleBasedStudyPlan(PerformanceAnalysisDTO analysis) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== PERSONALIZED STUDY PLAN (EduPulse Adaptive Advisor) ===\n\n");
        sb.append("Student: ").append(analysis.getStudentName()).append("\n");
        sb.append("Calculated Risk Level: ").append(analysis.getRiskLevel()).append("\n\n");

        if ("HIGH".equalsIgnoreCase(analysis.getRiskLevel())) {
            sb.append("1. Urgent Priority: High Academic Risk Detected\n");
            sb.append("   Your average score is currently ").append(analysis.getAverageMarks()).append("%, which requires immediate intervention.\n");
            sb.append("   - Weak Subjects: ").append(analysis.getWeakSubjects().isEmpty() ? "None flagged" : String.join(", ", analysis.getWeakSubjects())).append("\n");
            sb.append("   - Allocate at least 2.5 hours daily to core conceptual revision for weak subjects.\n");
            sb.append("   - Schedule weekly doubts-clearing sessions with your course professors.\n\n");
        } else if ("MEDIUM".equalsIgnoreCase(analysis.getRiskLevel())) {
            sb.append("1. Performance Assessment: Moderate Risk\n");
            sb.append("   Your average score is ").append(analysis.getAverageMarks()).append("%, showing good foundational knowledge but scope for distinction.\n");
            if (!analysis.getWeakSubjects().isEmpty()) {
                sb.append("   - Focus specifically on raising scores in: ").append(String.join(", ", analysis.getWeakSubjects())).append(".\n");
            }
            sb.append("   - Dedicate 1.5 hours daily to problem-solving and practicing past exam questions.\n\n");
        } else {
            sb.append("1. Performance Assessment: Low Risk (Excellent Standing)\n");
            sb.append("   Outstanding work! Your average score is ").append(analysis.getAverageMarks()).append("%.\n");
            sb.append("   - Maintain this momentum by exploring advanced project work and mock interview preparations.\n\n");
        }

        sb.append("2. Attendance & Engagement Guidance:\n");
        if (analysis.getAverageAttendance() < 75.0) {
            sb.append("   - Warning: Average attendance is ").append(analysis.getAverageAttendance()).append("%, which is below the recommended 75% threshold.\n");
            sb.append("   - Ensure consistent attendance to avoid exam eligibility issues and participate actively in class discussions.\n\n");
        } else {
            sb.append("   - Great job maintaining ").append(analysis.getAverageAttendance()).append("% attendance! Consistent presence strongly correlates with higher exam scores.\n\n");
        }

        sb.append("3. Recommended Weekly Strategy:\n");
        sb.append("   - Monday to Friday: 2 hours of focused study using the Pomodoro technique (25 min study / 5 min break).\n");
        sb.append("   - Saturday: Comprehensive self-assessment and practical coding/problem sets.\n");
        sb.append("   - Sunday: Weekly review, organizing notes, and planning next week's milestones.\n");

        return sb.toString();
    }
}

