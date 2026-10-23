package com.edupulse.controller;

import com.edupulse.dto.SyllabusDocumentDTO;
import com.edupulse.dto.SyllabusQueryRequestDTO;
import com.edupulse.dto.SyllabusQueryResponseDTO;
import com.edupulse.dto.SyllabusUploadRequestDTO;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.SyllabusRagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/syllabus")
public class SyllabusRagController {

    private final SyllabusRagService syllabusRagService;

    public SyllabusRagController(SyllabusRagService syllabusRagService) {
        this.syllabusRagService = syllabusRagService;
    }

    /**
     * POST /api/ai/syllabus/upload
     * Upload and index a new syllabus or lecture notes document (PDF, TXT, or raw text).
     */
    @PostMapping("/upload")
    public ResponseEntity<SyllabusDocumentDTO> uploadDocument(
            @Valid @RequestBody SyllabusUploadRequestDTO request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        SyllabusDocumentDTO dto = syllabusRagService.uploadAndIndexDocument(request, currentUser);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    /**
     * GET /api/ai/syllabus
     * List all uploaded syllabus and lecture note documents.
     */
    @GetMapping
    public ResponseEntity<List<SyllabusDocumentDTO>> listDocuments() {
        return ResponseEntity.ok(syllabusRagService.listAllDocuments());
    }

    /**
     * GET /api/ai/syllabus/{id}
     * Get details of a single syllabus document.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SyllabusDocumentDTO> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusRagService.getDocumentById(id));
    }

    /**
     * DELETE /api/ai/syllabus/{id}
     * Delete an uploaded syllabus document and its index chunks.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        syllabusRagService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/ai/syllabus/{id}
     * Update subject or title of an existing uploaded syllabus document.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SyllabusDocumentDTO> updateDocument(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String title = payload != null ? payload.get("title") : null;
        String subject = payload != null ? payload.get("subject") : null;
        return ResponseEntity.ok(syllabusRagService.updateDocument(id, title, subject));
    }

    /**
     * POST /api/ai/syllabus/query
     * Ask questions strictly grounded in the uploaded syllabus / lecture notes using RAG.
     */
    @PostMapping("/query")
    public ResponseEntity<SyllabusQueryResponseDTO> querySyllabus(
            @Valid @RequestBody SyllabusQueryRequestDTO request) {
        return ResponseEntity.ok(syllabusRagService.querySyllabus(request));
    }
}
