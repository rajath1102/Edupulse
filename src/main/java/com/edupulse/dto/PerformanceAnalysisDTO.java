package com.edupulse.dto;

import java.util.List;

/**
 * Data Transfer Object for Student Performance Analysis.
 */
public class PerformanceAnalysisDTO {

    private Long studentId;
    private String studentName;
    private Double averageMarks;
    private List<String> weakSubjects;
    private Double averageAttendance;
    private String riskLevel;
    private int totalSubjects;

    public PerformanceAnalysisDTO() {
    }

    public PerformanceAnalysisDTO(Long studentId, String studentName, Double averageMarks,
                                  List<String> weakSubjects, Double averageAttendance,
                                  String riskLevel, int totalSubjects) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.averageMarks = averageMarks;
        this.weakSubjects = weakSubjects;
        this.averageAttendance = averageAttendance;
        this.riskLevel = riskLevel;
        this.totalSubjects = totalSubjects;
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

    public Double getAverageMarks() {
        return averageMarks;
    }

    public void setAverageMarks(Double averageMarks) {
        this.averageMarks = averageMarks;
    }

    public List<String> getWeakSubjects() {
        return weakSubjects;
    }

    public void setWeakSubjects(List<String> weakSubjects) {
        this.weakSubjects = weakSubjects;
    }

    public Double getAverageAttendance() {
        return averageAttendance;
    }

    public void setAverageAttendance(Double averageAttendance) {
        this.averageAttendance = averageAttendance;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public int getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(int totalSubjects) {
        this.totalSubjects = totalSubjects;
    }
}

