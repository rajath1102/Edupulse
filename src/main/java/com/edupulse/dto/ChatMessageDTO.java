package com.edupulse.dto;

/**
 * Single turn in an EduBot conversation.
 */
public class ChatMessageDTO {

    private String role; // "user" or "model"
    private String text;

    public ChatMessageDTO() {
    }

    public ChatMessageDTO(String role, String text) {
        this.role = role;
        this.text = text;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
