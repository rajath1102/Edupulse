package com.edupulse.dto;

/**
 * Data Transfer Object for returning Student Performance records.
 */
public class PerformanceResponseDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private String subject;
    private Double marks;
    private Double attendance;

    public PerformanceResponseDTO() {
    }

    public PerformanceResponseDTO(Long id, Long studentId, String studentName, String subject, Double marks, Double attendance) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.subject = subject;
        this.marks = marks;
        this.attendance = attendance;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

