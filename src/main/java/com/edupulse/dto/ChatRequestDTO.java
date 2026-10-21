package com.edupulse.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Request payload for EduBot AI Tutor / Doubt Solver.
 */
public class ChatRequestDTO {

    @NotBlank(message = "Query message cannot be blank")
    private String message;

    private String subject = "General Academic";

    private List<ChatMessageDTO> history = new ArrayList<>();

    public ChatRequestDTO() {
    }

    public ChatRequestDTO(String message, String subject, List<ChatMessageDTO> history) {
        this.message = message;
        this.subject = subject != null ? subject : "General Academic";
        this.history = history != null ? history : new ArrayList<>();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public List<ChatMessageDTO> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessageDTO> history) {
        this.history = history;
    }
}
