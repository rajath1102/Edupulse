package com.edupulse.dto;

public class ScannedRecordDTO {

    private String studentName;
    private Long studentId;
    private boolean matched;
    private String subject;
    private Double marks;
    private Double attendance;
    private String notes;

    public ScannedRecordDTO() {
    }

    public ScannedRecordDTO(String studentName, Long studentId, boolean matched, String subject, Double marks, Double attendance, String notes) {
        this.studentName = studentName;
        this.studentId = studentId;
        this.matched = matched;
        this.subject = subject;
        this.marks = marks;
        this.attendance = attendance;
        this.notes = notes;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
