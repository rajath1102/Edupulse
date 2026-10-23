package com.edupulse.service;

import com.edupulse.dto.MockExamRequestDTO;
import com.edupulse.dto.MockExamResponseDTO;
import com.edupulse.exception.BadRequestException;
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
 * Service to generate university-standard Mock Exam Papers with detailed Answer Keys & Scoring Rubrics.
 * Powered by Google Gemini with intelligent university curriculum fallbacks.
 */
@Service
public class MockExamService {

    private static final Logger logger = LoggerFactory.getLogger(MockExamService.class);

    private final SyllabusDocumentRepository syllabusRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public MockExamService(SyllabusDocumentRepository syllabusRepository,
                           RestTemplate restTemplate,
                           ObjectMapper objectMapper) {
        this.syllabusRepository = syllabusRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Generates a complete mock examination paper, answer key, and scoring rubric.
     */
    public MockExamResponseDTO generateMockExam(MockExamRequestDTO request) {
        String subject = (request.getSubject() != null && !request.getSubject().isBlank())
                ? request.getSubject().trim()
                : "Computer Science & Engineering";
        String topic = (request.getTopic() != null && !request.getTopic().isBlank())
                ? request.getTopic().trim()
                : "Full Course Curriculum";
        String difficulty = (request.getDifficulty() != null && !request.getDifficulty().isBlank())
                ? request.getDifficulty().trim()
                : "Standard University";
        int totalMarks = (request.getTotalMarks() != null && request.getTotalMarks() > 0)
                ? request.getTotalMarks()
                : 50;
        int durationMinutes = (request.getDurationMinutes() != null && request.getDurationMinutes() > 0)
                ? request.getDurationMinutes()
                : 90;

        // Grounding on uploaded syllabus if specified
        String syllabusExcerpt = "";
        if (request.getSyllabusDocumentId() != null) {
            Optional<SyllabusDocument> docOpt = syllabusRepository.findById(request.getSyllabusDocumentId());
            if (docOpt.isPresent()) {
                SyllabusDocument doc = docOpt.get();
                String raw = doc.getRawText();
                syllabusExcerpt = (raw.length() > 3000) ? raw.substring(0, 3000) + "\n...[truncated]" : raw;
            }
        }

        String prompt = buildPrompt(subject, topic, difficulty, totalMarks, durationMinutes, syllabusExcerpt);

        // Try Gemini with multi-model fallback chain
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            String[] modelChain = {
                    geminiModel,
                    "gemini-1.5-flash",
                    "gemini-2.0-flash-lite",
                    "gemini-1.5-flash-latest"
            };

            for (String model : modelChain) {
                try {
                    String rawReply = callGeminiGenerateApi(prompt, model);
                    if (rawReply != null && !rawReply.isBlank()) {
                        logger.info("Mock Exam Paper generated successfully using model '{}'.", model);
                        return parseExamResponse(rawReply, subject, topic, difficulty, totalMarks, durationMinutes, "Google Gemini AI (" + model + ")");
                    }
                } catch (Exception ex) {
                    logger.warn("Mock Exam Generator: Model '{}' failed: {}. Trying next...", model, ex.getMessage());
                }
            }
        }

        // Heuristic University Exam Generator Fallback
        return generateHeuristicMockExam(subject, topic, difficulty, totalMarks, durationMinutes);
    }

    private String buildPrompt(String subject, String topic, String difficulty, int totalMarks, int durationMinutes, String syllabusExcerpt) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("""
                You are a senior university professor and Chief Controller of Examinations setting an official examination paper for an engineering university.
                Create a complete, rigorous, and highly realistic examination question paper, along with a complete Model Answer Key and detailed Step-by-Step Scoring Rubric.
                
                Course: %s
                Specific Topic / Module: %s
                Difficulty Level: %s
                Total Marks: %d
                Time Allowed: %d Minutes
                
                """, subject, topic, difficulty, totalMarks, durationMinutes));

        if (!syllabusExcerpt.isBlank()) {
            sb.append("\n--- SYLLABUS DIRECTIVES TO ALIGN WITH ---\n").append(syllabusExcerpt).append("\n-----------------------------------------\n");
        }

        sb.append("""
                Format requirements:
                Structure the output with clear markdown headings exactly as follows:
                
                # UNIVERSITY EXAMINATION PAPER
                Include header block (Subject code, Course name, Max marks, Time, General Instructions).
                
                ### SECTION A: Short Answer Questions (2 Marks Each)
                Provide 5 compulsory questions covering core definitions, distinctions, or quick calculations.
                
                ### SECTION B: Analytical & Descriptive Questions (10 Marks Each)
                Provide 4 descriptive/derivation/algorithmic questions with sub-parts (a) and (b), with internal choice (e.g. Q2 OR Q3).
                
                ---
                
                # MODEL ANSWER KEY
                Provide complete, mathematically and technically sound model answers for every question in Section A and Section B. Include necessary code, formulas, or step-by-step derivations.
                
                ---
                
                # STEP-BY-STEP SCORING RUBRIC
                Provide an itemized marking scheme for professors showing exact point distribution:
                E.g.:
                - Correct definition: 2 marks
                - Diagram / State Machine: 3 marks
                - Mathematical proof / Algorithm trace: 5 marks
                - Total: 10 marks
                """);

        return sb.toString();
    }

    private MockExamResponseDTO parseExamResponse(String rawText, String subject, String topic, String difficulty, int totalMarks, int durationMinutes, String aiSource) {
        String examPaper = rawText;
        String answerKey = "";
        String rubric = "";

        // Split by major markdown dividers if present
        if (rawText.contains("# MODEL ANSWER KEY")) {
            String[] parts = rawText.split("# MODEL ANSWER KEY");
            examPaper = parts[0].trim();
            String remaining = parts[1];

            if (remaining.contains("# STEP-BY-STEP SCORING RUBRIC")) {
                String[] subParts = remaining.split("# STEP-BY-STEP SCORING RUBRIC");
                answerKey = subParts[0].trim();
                rubric = subParts[1].trim();
            } else {
                answerKey = remaining.trim();
            }
        }

        String title = String.format("%s Mock Examination Paper (%d Marks)", subject, totalMarks);

        return new MockExamResponseDTO(
                title,
                subject,
                topic,
                difficulty,
                totalMarks,
                durationMinutes,
                examPaper,
                answerKey,
                rubric,
                aiSource
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

        throw new RuntimeException("Empty response from Gemini API");
    }

    private MockExamResponseDTO generateHeuristicMockExam(String subject, String topic, String difficulty, int totalMarks, int durationMinutes) {
        String paper = String.format("""
                # 🏛️ UNIVERSITY END-SEMESTER EXAMINATION
                
                **Course:** %s  
                **Topic Focus:** %s  
                **Difficulty:** %s  
                **Maximum Marks:** %d Marks  
                **Time Allowed:** %d Minutes  
                
                ---
                
                ### General Instructions:
                1. Answer **ALL** questions in **Section A** (10 Marks).
                2. Answer any **FOUR** questions from **Section B** (40 Marks).
                3. Assume suitable missing data if any, and state assumptions clearly.
                4. Neat visual diagrams, state charts, and algorithmic traces carry marks.
                
                ---
                
                ### 📝 SECTION A: Short Conceptual Questions (5 × 2 = 10 Marks)
                
                1. State the fundamental objective of %s and give one practical real-world application. *(2 Marks)*
                2. Distinguish between worst-case time complexity and amortized complexity with a concrete example. *(2 Marks)*
                3. Define the principle of locality of reference (Temporal vs Spatial). *(2 Marks)*
                4. Why is Conflict Serializability strictly preferred over View Serializability in database engines? *(2 Marks)*
                5. What is the difference between a Preemptive and Non-Preemptive scheduling policy? *(2 Marks)*
                
                ---
                
                ### 📋 SECTION B: Comprehensive Analytical Questions (4 × 10 = 40 Marks)
                
                #### **Question 6** *(10 Marks)*
                **(a)** Explain Dijkstra's shortest path algorithm step-by-step using an adjacency list and binary min-heap. Derive its time complexity `O((V + E) log V)`. *(5 Marks)*  
                **(b)** Given a weighted directed graph with vertices `{A, B, C, D, E}` and source vertex `A`, trace the state of the distance array and priority queue across each relaxation step. *(5 Marks)*
                
                *— OR —*
                
                #### **Question 7** *(10 Marks)*
                **(a)** What are the four Coffman conditions necessary for a Deadlock to occur in an operating system? *(4 Marks)*  
                **(b)** Explain Banker's Algorithm for deadlock avoidance with a numerical allocation and request matrix example. Demonstrate whether the system is in a safe state. *(6 Marks)*
                
                #### **Question 8** *(10 Marks)*
                **(a)** Discuss the 3NF and BCNF database normalization forms. Illustrate a scenario where a relation is in 3NF but violates BCNF due to overlapping candidate keys. *(6 Marks)*  
                **(b)** Describe the Two-Phase Locking (2PL) protocol. How does Strict 2PL prevent cascading aborts? *(4 Marks)*
                
                #### **Question 9** *(10 Marks)*
                **(a)** Compare TCP and UDP across connection semantics, packet header overhead, reliability guarantees, and flow control. *(5 Marks)*  
                **(b)** Diagram the TCP 3-Way Handshake connection establishment and 4-Way connection teardown, noting sequence and acknowledgment numbers. *(5 Marks)*
                """, subject, topic, difficulty, totalMarks, durationMinutes, topic);

        String answerKey = """
                ### 🔑 Model Answer Key
                
                #### Section A:
                - **Q1:** Formal definition and real-world system application (e.g. distributed index lookups).
                - **Q2:** Worst-case represents upper bound for any input `n`; Amortized calculates average cost per operation over a worst-case sequence of operations (e.g., ArrayList dynamic doubling).
                - **Q3:** Temporal locality = re-accessing recently used memory; Spatial locality = accessing adjacent memory addresses.
                - **Q4:** Conflict serializability can be tested in polynomial time `O(V + E)` using a precedence cycle graph; View serializability is NP-complete.
                - **Q5:** Preemptive forcibly takes CPU from running process (e.g., Round Robin); Non-preemptive waits until I/O or termination (e.g., FCFS).
                
                #### Section B:
                - **Q6:** Requires initialization `dist[s]=0`, min-heap relaxation formula `dist[v] = min(dist[v], dist[u] + w(u,v))`, and complete vertex extraction trace table.
                - **Q7:** Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Banker's trace requires calculating `Need = Max - Allocation` and generating a safe sequence.
                - **Q8:** BCNF requires that for every functional dependency `X -> Y`, `X` must be a super key. Strict 2PL holds exclusive locks until commit/abort, guaranteeing recoverable schedules.
                - **Q9:** TCP 20-60 byte header, in-order reliable stream, sliding window flow control. UDP 8-byte header, connectionless best-effort.
                """;

        String rubric = """
                ### 📊 Step-by-Step Scoring Rubric
                
                | Question | Component Criteria | Marks Awarded |
                |---|---|---|
                | **Section A (Q1–Q5)** | Accurate definition, correct terminology, brief example | **2 Marks each** (10 Marks total) |
                | **Q6 (a)** | Correct algorithmic pseudo-code + heap explanation | 3 Marks |
                | **Q6 (a)** | Formal Big-O time and space complexity derivation | 2 Marks |
                | **Q6 (b)** | Complete trace table with updated distance array | 5 Marks |
                | **Q7 (a)** | All 4 Coffman conditions correctly stated and explained | 4 Marks |
                | **Q7 (b)** | Calculation of Need Matrix + Verification of Safe Sequence | 6 Marks |
                | **Q8 (a)** | 3NF vs BCNF comparison table and candidate key counterexample | 6 Marks |
                | **Q8 (b)** | 2PL growing/shrinking phase diagram + cascading abort defense | 4 Marks |
                | **Q9 (a)** | 5-point comparison matrix (TCP vs UDP) | 5 Marks |
                | **Q9 (b)** | Complete ladder diagram with SYN, SYN-ACK, ACK seq numbers | 5 Marks |
                """;

        return new MockExamResponseDTO(
                String.format("%s Mock Examination Paper (%d Marks)", subject, totalMarks),
                subject,
                topic,
                difficulty,
                totalMarks,
                durationMinutes,
                paper,
                answerKey,
                rubric,
                "EduPulse University Examination Generator"
        );
    }
}
