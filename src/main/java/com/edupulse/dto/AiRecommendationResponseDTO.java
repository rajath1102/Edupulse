package com.edupulse.dto;

import java.util.List;

/**
 * Data Transfer Object for AI-Powered Adaptive Learning Recommendation.
 */
public class AiRecommendationResponseDTO {

    private Long studentId;
    private String studentName;
    private String riskLevel;
    private Double averageMarks;
    private Double averageAttendance;
    private List<String> weakSubjects;
    private String recommendation;
    private String aiSource;

    public AiRecommendationResponseDTO() {
    }

    public AiRecommendationResponseDTO(Long studentId, String studentName, String riskLevel,
                                       Double averageMarks, Double averageAttendance,
                                       List<String> weakSubjects, String recommendation,
                                       String aiSource) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.riskLevel = riskLevel;
        this.averageMarks = averageMarks;
        this.averageAttendance = averageAttendance;
        this.weakSubjects = weakSubjects;
        this.recommendation = recommendation;
        this.aiSource = aiSource;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Double getAverageMarks() {
        return averageMarks;
    }

    public void setAverageMarks(Double averageMarks) {
        this.averageMarks = averageMarks;
    }

    public Double getAverageAttendance() {
        return averageAttendance;
    }

    public void setAverageAttendance(Double averageAttendance) {
        this.averageAttendance = averageAttendance;
    }

    public List<String> getWeakSubjects() {
        return weakSubjects;
    }

    public void setWeakSubjects(List<String> weakSubjects) {
        this.weakSubjects = weakSubjects;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getAiSource() {
        return aiSource;
    }

    public void setAiSource(String aiSource) {
        this.aiSource = aiSource;
    }
}

