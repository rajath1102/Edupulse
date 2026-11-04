package com.edupulse.service;

import com.edupulse.dto.CheatSheetRequestDTO;
import com.edupulse.dto.CheatSheetResponseDTO;
import com.edupulse.model.SyllabusDocument;
import com.edupulse.repository.SyllabusDocumentRepository;
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
 * Service to generate Last-Night Revision Cheat Sheets for students facing exams tomorrow.
 * Extracts must-know 2-mark definitions, formulas, high-yield 10-mark diagrams, and pitfalls.
 */
@Service
public class CheatSheetService {

    private static final Logger logger = LoggerFactory.getLogger(CheatSheetService.class);

    private final SyllabusDocumentRepository syllabusRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public CheatSheetService(SyllabusDocumentRepository syllabusRepository,
                             RestTemplate restTemplate,
                             ObjectMapper objectMapper) {
        this.syllabusRepository = syllabusRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public CheatSheetResponseDTO generateCheatSheet(CheatSheetRequestDTO request) {
        String subject = request.getSubject() != null && !request.getSubject().isBlank()
                ? request.getSubject().trim()
                : "Coursework";
        String topic = request.getTopic() != null && !request.getTopic().isBlank()
                ? request.getTopic().trim()
                : "High-Yield University Modules";

        String syllabusContext = "";
        if (request.getSyllabusDocumentId() != null) {
            Optional<SyllabusDocument> docOpt = syllabusRepository.findById(request.getSyllabusDocumentId());
            if (docOpt.isPresent()) {
                String raw = docOpt.get().getRawText();
                syllabusContext = raw.length() > 3000 ? raw.substring(0, 3000) + "\n...[truncated]" : raw;
            }
        }

        // Try AI Cheat Sheet with Gemini
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            String[] modelChain = {
                    geminiModel,
                    "gemini-1.5-flash",
                    "gemini-2.0-flash-lite",
                    "gemini-1.5-flash-latest"
            };

            String prompt = String.format("""
                    You are a university academic coach creating a concise, high-yield 'Last-Night Revision Cheat Sheet' for students writing their semester final exam tomorrow morning.
                    
                    Subject: %s
                    Focus Topics: %s
                    
                    Syllabus Context (if available):
                    %s
                    
                    Generate a high-density, structured markdown cheat sheet formatted into 4 clear sections:
                    1. 📌 MUST-KNOW 2-MARK DEFINITIONS (Give 5 exact textbook definitions professors look for)
                    2. 🧮 CORE FORMULAS & GOVERNING LAWS / THEOREMS (Formulas, asymptotic complexities, rules)
                    3. 📈 HIGH-YIELD 10-MARK DIAGRAMS & DERIVATIONS (Key structural figures, algorithms, step derivations)
                    4. ⚠️ CRITICAL EXAM PITFALLS & MISTAKES TO AVOID (Common traps where students lose marks)
                    
                    Make it extremely clear, bulleted, bolded, and immediate to memorize in under 15 minutes.
                    """,
                    subject, topic, syllabusContext
            );

            for (String model : modelChain) {
                try {
                    String raw = callGeminiGenerateApi(prompt, model);
                    if (raw != null && !raw.isBlank()) {
                        return buildResponseFromMarkdown(subject, topic, raw, "Google Gemini AI (" + model + ")");
                    }
                } catch (Exception e) {
                    logger.warn("CheatSheetService: Model {} failed: {}", model, e.getMessage());
                }
            }
        }

        // Heuristic fallback cheat sheet
        return generateHeuristicCheatSheet(subject, topic);
    }

    private CheatSheetResponseDTO buildResponseFromMarkdown(String subject, String topic, String md, String aiSource) {
        List<String> defs = Arrays.asList(
                "Formal definition with precise academic terminology and zero conversational slang.",
                "Primary constraint or invariant definition required in introductory 2-mark questions.",
                "Asymptotic boundary or state conditions."
        );
        List<String> formulas = Arrays.asList(
                "Asymptotic Complexity Bounds: O(1) < O(log n) < O(n) < O(n log n) < O(n²)",
                "State Transition / Invariant Equations and Boundary Conditions"
        );
        List<String> diagrams = Arrays.asList(
                "Architectural block diagram showing component interactions.",
                "Stepwise state-machine / sequence diagram with properly labeled edges."
        );
        List<String> pitfalls = Arrays.asList(
                "Writing informal definitions instead of technical keywords.",
                "Forgetting to label graph axes or state diagram transitions.",
                "Skipping intermediate algebraic derivation steps in 10-mark problems."
        );

        return new CheatSheetResponseDTO(
                subject,
                topic,
                md,
                defs,
                formulas,
                diagrams,
                pitfalls,
                aiSource
        );
    }

    private CheatSheetResponseDTO generateHeuristicCheatSheet(String subject, String topic) {
        String md = String.format("""
                # ⚡ %s — Last-Night Exam Revision Sheet
                ### Module Focus: %s
                *Curated for 15-minute quick revision before entering the exam hall.*
                
                ---
                
                ### 1. 📌 MUST-KNOW 2-MARK DEFINITIONS
                * **Core Concept Definition:** State the fundamental formal textbook definition without generic language. Clearly highlight primary properties.
                * **Primary vs Secondary Mechanisms:** Distinguish between direct hardware/system execution versus virtualized abstractions.
                * **Invariants & Safety Rules:** Explicitly write down the conditions that must hold true before and after state transitions.
                * **Serializability / Convergence:** State the necessary and sufficient criteria for consistent multi-agent or concurrent operations.
                * **Trade-off Duality:** Contrast Space Complexity vs Time Complexity or Latency vs Throughput.
                
                ---
                
                ### 2. 🧮 CORE FORMULAS & GOVERNING LAWS
                * **Efficiency Hierarchy:** `O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N)`.
                * **Amdahl's Law:** `Speedup = 1 / ((1 - P) + (P / S))` where P is parallel fraction and S is processor count.
                * **Little's Law:** `L = λ * W` (Average items in system = arrival rate × average waiting time).
                * **Closure & Derivation Rule:** When calculating attribute closures, systematically apply Armstrong's Axioms (Reflexivity, Augmentation, Transitivity).
                
                ---
                
                ### 3. 📈 HIGH-YIELD 10-MARK DIAGRAMS & DERIVATIONS
                * **System Architecture Diagram:** Always draw functional blocks (Input Interface, Execution Engine, Memory/Buffer Manager, Persistence Layer).
                * **Stepwise State Trace Table:** When an analytical problem is given, draw a 4-column table: `[Step, Current Element, State Array, Action Taken]`.
                * **Two-Phase Protocol Progression:** Illustrate the Growing Phase (lock acquisition without release) followed by the Shrinking Phase (release without acquisition).
                
                ---
                
                ### 4. ⚠️ CRITICAL EXAM PITFALLS (DO NOT DO THIS)
                * ❌ **Pitfall 1:** Leaving diagrams unlabeled. Professors deduct 50%% of diagram marks if blocks lack titles or arrows lack direction.
                * ❌ **Pitfall 2:** Writing purely textual paragraphs for 10-mark questions instead of clear bullet points with bold subheadings.
                * ❌ **Pitfall 3:** Forgetting edge cases (empty input, divide-by-zero, cyclic dependency) in numerical derivations.
                """, subject, topic);

        return buildResponseFromMarkdown(subject, topic, md, "EduPulse Academic Exam Preparation Engine");
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

        throw new RuntimeException("Empty response from Gemini CheatSheet API");
    }
}
