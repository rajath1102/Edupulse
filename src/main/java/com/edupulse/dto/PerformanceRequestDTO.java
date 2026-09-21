package com.edupulse.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for creating or updating a Performance record.
 */
public class PerformanceRequestDTO {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Subject name cannot be empty")
    private String subject;

    @NotNull(message = "Marks are required")
    @Min(value = 0, message = "Marks must be at least 0")
    @Max(value = 100, message = "Marks cannot exceed 100")
    private Double marks;

    @NotNull(message = "Attendance is required")
    @Min(value = 0, message = "Attendance must be at least 0")
    @Max(value = 100, message = "Attendance cannot exceed 100")
    private Double attendance;

    public PerformanceRequestDTO() {
    }

    public PerformanceRequestDTO(Long studentId, String subject, Double marks, Double attendance) {
        this.studentId = studentId;
        this.subject = subject;
        this.marks = marks;
        this.attendance = attendance;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Double getMarks() {
        return marks;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }

    public Double getAttendance() {
        return attendance;
    }

    public void setAttendance(Double attendance) {
        this.attendance = attendance;
    }
}

