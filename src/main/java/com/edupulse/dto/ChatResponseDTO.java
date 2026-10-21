package com.edupulse.dto;

import java.time.Instant;

/**
 * Response payload returned by EduBot AI Tutor.
 */
public class ChatResponseDTO {

    private String reply;
    private String aiSource;
    private String subject;
    private String timestamp;

    public ChatResponseDTO() {
        this.timestamp = Instant.now().toString();
    }

    public ChatResponseDTO(String reply, String aiSource, String subject) {
        this.reply = reply;
        this.aiSource = aiSource;
        this.subject = subject;
        this.timestamp = Instant.now().toString();
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getAiSource() {
        return aiSource;
    }

    public void setAiSource(String aiSource) {
        this.aiSource = aiSource;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
