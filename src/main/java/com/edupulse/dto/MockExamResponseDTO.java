package com.edupulse.dto;

public class MockExamResponseDTO {

    private String title;
    private String subject;
    private String topic;
    private String difficulty;
    private Integer totalMarks;
    private Integer durationMinutes;
    private String examPaperMarkdown;
    private String answerKeyMarkdown;
    private String rubricMarkdown;
    private String aiSource;

    public MockExamResponseDTO() {}

    public MockExamResponseDTO(String title, String subject, String topic, String difficulty, Integer totalMarks, Integer durationMinutes, String examPaperMarkdown, String answerKeyMarkdown, String rubricMarkdown, String aiSource) {
        this.title = title;
        this.subject = subject;
        this.topic = topic;
        this.difficulty = difficulty;
        this.totalMarks = totalMarks;
        this.durationMinutes = durationMinutes;
        this.examPaperMarkdown = examPaperMarkdown;
        this.answerKeyMarkdown = answerKeyMarkdown;
        this.rubricMarkdown = rubricMarkdown;
        this.aiSource = aiSource;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getExamPaperMarkdown() {
        return examPaperMarkdown;
    }

    public void setExamPaperMarkdown(String examPaperMarkdown) {
        this.examPaperMarkdown = examPaperMarkdown;
    }

    public String getAnswerKeyMarkdown() {
        return answerKeyMarkdown;
    }

    public void setAnswerKeyMarkdown(String answerKeyMarkdown) {
        this.answerKeyMarkdown = answerKeyMarkdown;
    }

    public String getRubricMarkdown() {
        return rubricMarkdown;
    }

    public void setRubricMarkdown(String rubricMarkdown) {
        this.rubricMarkdown = rubricMarkdown;
    }

    public String getAiSource() {
        return aiSource;
    }

    public void setAiSource(String aiSource) {
        this.aiSource = aiSource;
    }
}
