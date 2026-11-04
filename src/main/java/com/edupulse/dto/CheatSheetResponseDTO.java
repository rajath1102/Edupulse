package com.edupulse.dto;

import java.util.List;

public class CheatSheetResponseDTO {

    private String subject;
    private String topic;
    private String markdownContent;
    private List<String> keyDefinitions;
    private List<String> coreFormulasAndRules;
    private List<String> highYieldDiagrams;
    private List<String> commonPitfalls;
    private String aiSource;

    public CheatSheetResponseDTO() {
    }

    public CheatSheetResponseDTO(String subject, String topic, String markdownContent,
                                List<String> keyDefinitions, List<String> coreFormulasAndRules,
                                List<String> highYieldDiagrams, List<String> commonPitfalls, String aiSource) {
        this.subject = subject;
        this.topic = topic;
        this.markdownContent = markdownContent;
        this.keyDefinitions = keyDefinitions;
        this.coreFormulasAndRules = coreFormulasAndRules;
        this.highYieldDiagrams = highYieldDiagrams;
        this.commonPitfalls = commonPitfalls;
        this.aiSource = aiSource;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getMarkdownContent() {
        return markdownContent;
    }

    public void setMarkdownContent(String markdownContent) {
        this.markdownContent = markdownContent;
    }

    public List<String> getKeyDefinitions() {
        return keyDefinitions;
    }

    public void setKeyDefinitions(List<String> keyDefinitions) {
        this.keyDefinitions = keyDefinitions;
    }

    public List<String> getCoreFormulasAndRules() {
        return coreFormulasAndRules;
    }

    public void setCoreFormulasAndRules(List<String> coreFormulasAndRules) {
        this.coreFormulasAndRules = coreFormulasAndRules;
    }

    public List<String> getHighYieldDiagrams() {
        return highYieldDiagrams;
    }

    public void setHighYieldDiagrams(List<String> highYieldDiagrams) {
        this.highYieldDiagrams = highYieldDiagrams;
    }

    public List<String> getCommonPitfalls() {
        return commonPitfalls;
    }

    public void setCommonPitfalls(List<String> commonPitfalls) {
        this.commonPitfalls = commonPitfalls;
    }

    public String getAiSource() {
        return aiSource;
    }

    public void setAiSource(String aiSource) {
        this.aiSource = aiSource;
    }
}
