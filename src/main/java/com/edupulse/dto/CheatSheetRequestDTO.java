package com.edupulse.dto;

import jakarta.validation.constraints.NotBlank;

public class CheatSheetRequestDTO {

    @NotBlank(message = "Subject name is required.")
    private String subject;

    private String topic; // Optional unit/topic filter
    private Long syllabusDocumentId; // Optional uploaded syllabus doc to ground on

    public CheatSheetRequestDTO() {
    }

    public CheatSheetRequestDTO(String subject, String topic, Long syllabusDocumentId) {
        this.subject = subject;
        this.topic = topic;
        this.syllabusDocumentId = syllabusDocumentId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Long getSyllabusDocumentId() {
        return syllabusDocumentId;
    }

    public void setSyllabusDocumentId(Long syllabusDocumentId) {
        this.syllabusDocumentId = syllabusDocumentId;
    }
}
