package com.edupulse.dto;

import jakarta.validation.constraints.NotBlank;

public class SyllabusQueryRequestDTO {

    private Long documentId; // Optional: specific document, or null to search all in subject

    private String subject;

    @NotBlank(message = "Question or topic query cannot be empty")
    private String question;

    public SyllabusQueryRequestDTO() {}

    public SyllabusQueryRequestDTO(Long documentId, String subject, String question) {
        this.documentId = documentId;
        this.subject = subject;
        this.question = question;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
