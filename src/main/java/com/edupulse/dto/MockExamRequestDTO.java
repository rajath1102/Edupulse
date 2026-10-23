package com.edupulse.dto;

import jakarta.validation.constraints.NotBlank;

public class MockExamRequestDTO {

    @NotBlank(message = "Subject is required")
    private String subject;

    private String topic; // Specific topic, module, or "Comprehensive Semester Exam"

    private String difficulty; // "Easy / Conceptual", "Standard University", "Challenging / GATE Level"

    private Integer totalMarks; // Default 50 or 100

    private Integer durationMinutes; // Default 60 or 120

    private Long syllabusDocumentId; // Optional: Link to an uploaded syllabus document to base questions on!

    public MockExamRequestDTO() {}

    public MockExamRequestDTO(String subject, String topic, String difficulty, Integer totalMarks, Integer durationMinutes) {
        this.subject = subject;
        this.topic = topic;
        this.difficulty = difficulty;
        this.totalMarks = totalMarks;
        this.durationMinutes = durationMinutes;
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

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Long getSyllabusDocumentId() {
        return syllabusDocumentId;
    }

    public void setSyllabusDocumentId(Long syllabusDocumentId) {
        this.syllabusDocumentId = syllabusDocumentId;
    }
}
