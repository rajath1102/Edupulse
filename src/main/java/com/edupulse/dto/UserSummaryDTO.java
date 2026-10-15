package com.edupulse.dto;

import com.edupulse.model.Role;

/**
 * Summary DTO for the currently authenticated user (/api/auth/me).
 */
public class UserSummaryDTO {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private Long studentId;
    private String studentName;

    public UserSummaryDTO() {
    }

    public UserSummaryDTO(Long id, String username, String email, Role role, Long studentId, String studentName) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.studentId = studentId;
        this.studentName = studentName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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
}
