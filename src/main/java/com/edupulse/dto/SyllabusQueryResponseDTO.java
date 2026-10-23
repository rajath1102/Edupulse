package com.edupulse.dto;

import java.util.List;

public class SyllabusQueryResponseDTO {

    private String question;
    private String answer;
    private String subject;
    private String documentTitle;
    private List<String> citations;
    private List<RetrievedChunkDTO> retrievedChunks;
    private String aiSource;

    public SyllabusQueryResponseDTO() {}

    public SyllabusQueryResponseDTO(String question, String answer, String subject, String documentTitle, List<String> citations, List<RetrievedChunkDTO> retrievedChunks, String aiSource) {
        this.question = question;
        this.answer = answer;
        this.subject = subject;
        this.documentTitle = documentTitle;
        this.citations = citations;
        this.retrievedChunks = retrievedChunks;
        this.aiSource = aiSource;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDocumentTitle() {
        return documentTitle;
    }

    public void setDocumentTitle(String documentTitle) {
        this.documentTitle = documentTitle;
    }

    public List<String> getCitations() {
        return citations;
    }

    public void setCitations(List<String> citations) {
        this.citations = citations;
    }

    public List<RetrievedChunkDTO> getRetrievedChunks() {
        return retrievedChunks;
    }

    public void setRetrievedChunks(List<RetrievedChunkDTO> retrievedChunks) {
        this.retrievedChunks = retrievedChunks;
    }

    public String getAiSource() {
        return aiSource;
    }

    public void setAiSource(String aiSource) {
        this.aiSource = aiSource;
    }
}
