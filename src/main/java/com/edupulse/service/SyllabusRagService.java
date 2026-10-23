package com.edupulse.service;

import com.edupulse.dto.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.model.SyllabusChunk;
import com.edupulse.model.SyllabusDocument;
import com.edupulse.repository.SyllabusChunkRepository;
import com.edupulse.repository.SyllabusDocumentRepository;
import com.edupulse.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service providing Syllabus & Lecture Notes RAG (Retrieval-Augmented Generation).
 * Ingests, chunks, indexes, and queries university course documents with Gemini AI.
 */
@Service
public class SyllabusRagService {

    private static final Logger logger = LoggerFactory.getLogger(SyllabusRagService.class);

    private final SyllabusDocumentRepository documentRepository;
    private final SyllabusChunkRepository chunkRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public SyllabusRagService(SyllabusDocumentRepository documentRepository,
                              SyllabusChunkRepository chunkRepository,
                              RestTemplate restTemplate,
                              ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Ingest and index a new syllabus or lecture notes document.
     */
    @Transactional
    public SyllabusDocumentDTO uploadAndIndexDocument(SyllabusUploadRequestDTO request, UserPrincipal currentUser) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Document title is required.");
        }
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new BadRequestException("Subject name is required.");
        }

        String extractedText = "";
        String fileType = request.getFileType() != null ? request.getFileType().toUpperCase() : "TEXT";
        long fileSize = 0;

        // 1. Extract text from Base64 PDF or raw text
        if (request.getBase64Content() != null && !request.getBase64Content().isBlank()) {
            try {
                String cleanBase64 = request.getBase64Content();
                if (cleanBase64.contains(",")) {
                    cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                }
                cleanBase64 = cleanBase64.replaceAll("\\s+", "");
                byte[] fileBytes = Base64.getDecoder().decode(cleanBase64);
                fileSize = fileBytes.length;

                if ("PDF".equalsIgnoreCase(fileType) || (request.getFileName() != null && request.getFileName().toLowerCase().endsWith(".pdf"))) {
                    try (PDDocument document = Loader.loadPDF(fileBytes)) {
                        PDFTextStripper stripper = new PDFTextStripper();
                        extractedText = stripper.getText(document);
                    }
                    fileType = "PDF";
                } else {
                    extractedText = new String(fileBytes, StandardCharsets.UTF_8);
                }
            } catch (Exception ex) {
                logger.warn("Failed to parse base64 file as PDF: {}. Falling back to raw text.", ex.getMessage());
                if (request.getRawText() != null && !request.getRawText().isBlank()) {
                    extractedText = request.getRawText();
                } else {
                    throw new BadRequestException("Could not extract text from uploaded document: " + ex.getMessage());
                }
            }
        } else if (request.getRawText() != null && !request.getRawText().isBlank()) {
            extractedText = request.getRawText();
            fileSize = extractedText.getBytes(StandardCharsets.UTF_8).length;
        } else {
            throw new BadRequestException("Either rawText or base64Content must be provided.");
        }

        extractedText = extractedText.trim();
        if (extractedText.isEmpty()) {
            throw new BadRequestException("Uploaded document contains no readable text.");
        }

        String uploader = (currentUser != null && currentUser.getUsername() != null)
                ? currentUser.getUsername()
                : "Student";

        // 2. Create document entity
        SyllabusDocument document = new SyllabusDocument(
                request.getTitle().trim(),
                request.getSubject().trim(),
                request.getFileName() != null ? request.getFileName() : "syllabus.txt",
                fileType,
                fileSize,
                extractedText,
                uploader
        );

        // 3. Chunk the text with overlap and heading extraction
        List<SyllabusChunk> chunks = chunkText(extractedText, document);
        document.setChunkCount(chunks.size());

        for (SyllabusChunk chunk : chunks) {
            document.addChunk(chunk);
        }

        SyllabusDocument savedDoc = documentRepository.save(document);
        logger.info("Indexed syllabus document '{}' (ID: {}) with {} semantic chunks.", savedDoc.getTitle(), savedDoc.getId(), chunks.size());

        return mapToDTO(savedDoc);
    }

    /**
     * List all uploaded syllabus documents.
     */
    public List<SyllabusDocumentDTO> listAllDocuments() {
        return documentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get details of a single syllabus document.
     */
    public SyllabusDocumentDTO getDocumentById(Long id) {
        SyllabusDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus document", "id", id));
        return mapToDTO(doc);
    }

    /**
     * Delete a syllabus document.
     */
    @Transactional
    public void deleteDocument(Long id) {
        if (!documentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Syllabus document", "id", id);
        }
        documentRepository.deleteById(id);
    }

    /**
     * Query the syllabus using Retrieval-Augmented Generation (RAG).
     */
    public SyllabusQueryResponseDTO querySyllabus(SyllabusQueryRequestDTO request) {
        String question = request.getQuestion() != null ? request.getQuestion().trim() : "";
        if (question.isEmpty()) {
            throw new BadRequestException("Query question cannot be blank.");
        }

        // 1. Fetch relevant chunks from specified document or all documents
        List<SyllabusChunk> candidateChunks;
        String subject = request.getSubject() != null && !request.getSubject().isBlank()
                ? request.getSubject()
                : "General Academic";
        String documentTitle = "University Course Syllabus";

        if (request.getDocumentId() != null) {
            SyllabusDocument doc = documentRepository.findById(request.getDocumentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Syllabus document", "id", request.getDocumentId()));
            candidateChunks = doc.getChunks();
            documentTitle = doc.getTitle();
            subject = doc.getSubject();
        } else {
            List<SyllabusDocument> allDocs = documentRepository.findAll();
            if (allDocs.isEmpty()) {
                // If no documents uploaded yet, seed a default syllabus context
                seedSampleSyllabusIfEmpty();
                allDocs = documentRepository.findAll();
            }
            candidateChunks = allDocs.stream()
                    .flatMap(d -> d.getChunks().stream())
                    .collect(Collectors.toList());
            if (!allDocs.isEmpty()) {
                documentTitle = allDocs.get(0).getTitle();
                subject = allDocs.get(0).getSubject();
            }
        }

        // 2. Perform Retrieval Scoring (BM25 / Keyword Overlap & Heading Matching)
        List<RetrievedChunkDTO> topChunks = retrieveTopChunks(candidateChunks, question, 3);

        List<String> citations = topChunks.stream()
                .map(c -> String.format("%s (Chunk #%d)", c.getUnitOrHeading(), c.getChunkIndex() + 1))
                .distinct()
                .collect(Collectors.toList());

        // 3. Construct Grounded RAG Prompt for Gemini
        StringBuilder contextBuilder = new StringBuilder();
        for (int i = 0; i < topChunks.size(); i++) {
            RetrievedChunkDTO c = topChunks.get(i);
            contextBuilder.append(String.format("""
                    --- EXCERPT %d [%s] ---
                    %s
                    
                    """, i + 1, c.getUnitOrHeading(), c.getContent()));
        }

        String ragPrompt = String.format("""
                You are EduPulse's University Syllabus & Coursework Grounded AI Tutor.
                Your task is to answer the student's question accurately, rigorously, and STRICTLY grounded in the provided syllabus excerpts below.
                
                Guidelines:
                1. Explicitly cite the specific Unit, Module, or Section heading mentioned in the excerpts.
                2. Explain key definitions, formulas, algorithms, and exam requirements mentioned in the text.
                3. Highlight likely 2-mark or 10-mark exam questions based on the depth of the unit.
                4. If the excerpt does not contain the complete answer, acknowledge what the syllabus outlines first, then provide standard university-level academic guidance.
                
                --- RETRIEVED SYLLABUS / LECTURE NOTES CONTEXT ---
                %s
                ---------------------------------------------------
                
                Student Question:
                %s
                """, contextBuilder.toString(), question);

        // 4. Call Gemini API with Fallback Chain
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            String[] modelFallbackChain = {
                    geminiModel,
                    "gemini-1.5-flash",
                    "gemini-2.0-flash-lite",
                    "gemini-1.5-flash-latest"
            };

            for (String model : modelFallbackChain) {
                try {
                    String reply = callGeminiGenerateApi(ragPrompt, model);
                    if (reply != null && !reply.isBlank()) {
                        logger.info("Syllabus RAG: Generated response using model '{}'.", model);
                        return new SyllabusQueryResponseDTO(
                                question,
                                reply,
                                subject,
                                documentTitle,
                                citations,
                                topChunks,
                                "Google Gemini AI (" + model + ") [Grounded RAG]"
                        );
                    }
                } catch (Exception ex) {
                    logger.warn("Syllabus RAG: Model '{}' failed: {}. Trying next...", model, ex.getMessage());
                }
            }
        }

        // 5. Intelligent Grounded Fallback Synthesis
        String fallbackAnswer = generateHeuristicRagReply(question, topChunks, subject);
        return new SyllabusQueryResponseDTO(
                question,
                fallbackAnswer,
                subject,
                documentTitle,
                citations,
                topChunks,
                "EduPulse Local RAG Knowledge Engine"
        );
    }

    /**
     * Chunk text into overlapping passages with automated Unit / Module detection.
     */
    private List<SyllabusChunk> chunkText(String rawText, SyllabusDocument document) {
        List<SyllabusChunk> chunks = new ArrayList<>();
        if (rawText == null || rawText.isBlank()) return chunks;

        // Split by major sections or double newlines
        String[] paragraphs = rawText.split("\\n\\s*\\n+");
        StringBuilder currentChunk = new StringBuilder();
        String currentHeading = "General Syllabus";
        int chunkIdx = 0;

        Pattern unitPattern = Pattern.compile("(?i)(Unit\\s*[-:#]?\\s*\\d+|Module\\s*[-:#]?\\s*\\d+|Chapter\\s*[-:#]?\\s*\\d+|Section\\s*[-:#]?\\s*\\d+|Part\\s*[-:#]?\\s*[A-Z0-9]+)[^\\n]*");

        for (String p : paragraphs) {
            String trimmed = p.trim();
            if (trimmed.isEmpty()) continue;

            Matcher m = unitPattern.matcher(trimmed);
            if (m.find()) {
                currentHeading = m.group().trim();
                if (currentHeading.length() > 60) {
                    currentHeading = currentHeading.substring(0, 60);
                }
            }

            if (currentChunk.length() + trimmed.length() > 900 && currentChunk.length() > 0) {
                int tokenEst = currentChunk.length() / 4;
                SyllabusChunk chunk = new SyllabusChunk(chunkIdx++, currentHeading, currentChunk.toString().trim(), tokenEst);
                chunks.add(chunk);

                // Overlap: retain last 150 characters
                String prevText = currentChunk.toString();
                String overlap = prevText.length() > 150 ? prevText.substring(prevText.length() - 150) + "\n" : "";
                currentChunk = new StringBuilder(overlap);
            }

            currentChunk.append(trimmed).append("\n\n");
        }

        if (currentChunk.length() > 0) {
            int tokenEst = currentChunk.length() / 4;
            SyllabusChunk chunk = new SyllabusChunk(chunkIdx, currentHeading, currentChunk.toString().trim(), tokenEst);
            chunks.add(chunk);
        }

        return chunks;
    }

    /**
     * BM25 / Keyword Overlap retrieval algorithm.
     */
    private List<RetrievedChunkDTO> retrieveTopChunks(List<SyllabusChunk> chunks, String query, int topK) {
        if (chunks == null || chunks.isEmpty()) return Collections.emptyList();

        String[] queryTerms = query.toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .split("\\s+");
        Set<String> stopWords = Set.of("what", "is", "the", "in", "and", "for", "to", "of", "a", "an", "explain", "how", "does", "with", "about");
        List<String> keywords = Arrays.stream(queryTerms)
                .filter(w -> w.length() > 2 && !stopWords.contains(w))
                .collect(Collectors.toList());

        List<RetrievedChunkDTO> scoredList = new ArrayList<>();

        for (SyllabusChunk c : chunks) {
            String content = c.getContent().toLowerCase();
            String heading = c.getUnitOrHeading().toLowerCase();
            double score = 0.0;

            for (String kw : keywords) {
                if (heading.contains(kw)) {
                    score += 5.0; // Boost for matches in Unit/Section title
                }
                int count = 0;
                int idx = 0;
                while ((idx = content.indexOf(kw, idx)) != -1) {
                    count++;
                    idx += kw.length();
                }
                score += Math.min(count, 5) * 1.5;
            }

            // Bonus for phrase match
            String cleanQuery = query.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").trim();
            if (cleanQuery.length() > 4 && content.contains(cleanQuery)) {
                score += 10.0;
            }

            if (score > 0) {
                scoredList.add(new RetrievedChunkDTO(c.getId(), c.getChunkIndex(), c.getUnitOrHeading(), c.getContent(), score));
            }
        }

        scoredList.sort((a, b) -> Double.compare(b.getRelevanceScore(), a.getRelevanceScore()));

        // If no keywords matched, return first chunks as default
        if (scoredList.isEmpty()) {
            for (int i = 0; i < Math.min(chunks.size(), topK); i++) {
                SyllabusChunk c = chunks.get(i);
                scoredList.add(new RetrievedChunkDTO(c.getId(), c.getChunkIndex(), c.getUnitOrHeading(), c.getContent(), 1.0));
            }
        }

        return scoredList.stream().limit(topK).collect(Collectors.toList());
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

    private String generateHeuristicRagReply(String question, List<RetrievedChunkDTO> chunks, String subject) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 📚 Grounded Syllabus Answer\n\n");
        sb.append("**Question:** ").append(question).append("\n");
        sb.append("**Subject:** ").append(subject).append("\n\n");

        if (!chunks.isEmpty()) {
            RetrievedChunkDTO primary = chunks.get(0);
            sb.append("#### 📍 Relevant Section: **").append(primary.getUnitOrHeading()).append("**\n");
            sb.append("Based on the uploaded course notes and syllabus:\n\n");
            sb.append("> ").append(primary.getContent().replaceAll("\n", "\n> ")).append("\n\n");
        }

        sb.append("#### 🎓 Exam Preparation Guidance:\n");
        sb.append("1. **Core Concept:** Ensure you can state the formal textbook definition without relying on informal jargon.\n");
        sb.append("2. **Derivations & Diagrams:** In semester exams, topics from this unit frequently appear as **5 to 10 mark descriptive questions** requiring neat block diagrams or state tables.\n");
        sb.append("3. **Practice Problems:** Review standard university previous-year questions (PYQs) associated with this specific unit.\n");

        return sb.toString();
    }

    private void seedSampleSyllabusIfEmpty() {
        if (documentRepository.count() > 0) return;

        String sampleText = """
                COURSE: CS301 - DATABASE MANAGEMENT SYSTEMS (DBMS)
                
                UNIT 1: INTRODUCTION AND RELATIONAL MODEL
                Entity-Relationship (ER) Modeling: Entities, Attributes, Entity Sets, Relationships, Constraints, Keys (Primary, Super, Candidate, Foreign Keys).
                Relational Model: Relational algebra operations (Selection, Projection, Join, Division, Cartesian Product).
                SQL: DDL, DML, DCL commands, Subqueries, Aggregate functions, Views, Triggers.
                
                UNIT 2: DATABASE DESIGN & NORMALIZATION
                Functional Dependencies: Inference rules (Armstrong's Axioms), Closure of functional dependencies, Minimal covers.
                Normalization Theory:
                - First Normal Form (1NF): Atomic attributes, elimination of repeating groups.
                - Second Normal Form (2NF): Removal of partial dependencies.
                - Third Normal Form (3NF): Removal of transitive dependencies.
                - Boyce-Codd Normal Form (BCNF): Stricter version where every determinant is a super key.
                Lossless-join decomposition and Dependency preservation algorithms.
                
                UNIT 3: TRANSACTION PROCESSING & CONCURRENCY CONTROL
                Transaction Concept: Transaction states, ACID properties (Atomicity, Consistency, Isolation, Durability).
                Concurrent Executions: Serializability, Conflict serializability, View serializability, Precedence graphs.
                Concurrency Control Protocols:
                - Two-Phase Locking (2PL): Strict 2PL and Rigorous 2PL.
                - Timestamp-based protocols and Thomas Write Rule.
                - Deadlock Handling: Deadlock prevention, Deadlock detection via Wait-For Graphs, Deadlock recovery.
                
                UNIT 4: STORAGE AND INDEXING
                File Organization: Heap files, Sorted files, Hashing techniques (Static and Dynamic hashing).
                Indexing Structures:
                - Primary and Secondary Indexes, Clustered vs Non-Clustered Indexes.
                - B-Trees and B+ Trees: Search, insertion, and deletion algorithms. Time complexity O(log N).
                """;

        SyllabusDocument sampleDoc = new SyllabusDocument(
                "Standard University DBMS Syllabus (CS301)",
                "Database Management (DBMS)",
                "dbms_cs301_syllabus.txt",
                "TEXT",
                (long) sampleText.length(),
                sampleText,
                "Admin"
        );

        List<SyllabusChunk> chunks = chunkText(sampleText, sampleDoc);
        sampleDoc.setChunkCount(chunks.size());
        for (SyllabusChunk c : chunks) {
            sampleDoc.addChunk(c);
        }
        documentRepository.save(sampleDoc);
        logger.info("Seeded default sample university syllabus with {} chunks.", chunks.size());
    }

    @Transactional
    public SyllabusDocumentDTO updateDocument(Long id, String title, String subject) {
        SyllabusDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SyllabusDocument", "id", id));
        if (title != null && !title.isBlank()) {
            doc.setTitle(title.trim());
        }
        if (subject != null && !subject.isBlank()) {
            doc.setSubject(subject.trim());
        }
        SyllabusDocument saved = documentRepository.save(doc);
        return mapToDTO(saved);
    }

    private SyllabusDocumentDTO mapToDTO(SyllabusDocument doc) {
        String preview = doc.getRawText() != null
                ? (doc.getRawText().length() > 200 ? doc.getRawText().substring(0, 200) + "..." : doc.getRawText())
                : "";
        return new SyllabusDocumentDTO(
                doc.getId(),
                doc.getTitle(),
                doc.getSubject(),
                doc.getFileName(),
                doc.getFileType(),
                doc.getFileSize(),
                doc.getChunkCount(),
                doc.getUploadedBy(),
                doc.getCreatedAt(),
                preview
        );
    }
}
