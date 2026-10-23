package com.edupulse.dto;

import jakarta.validation.constraints.NotBlank;

public class SyllabusUploadRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String fileName;

    private String fileType; // PDF, TXT, MD, TEXT

    private String base64Content; // For PDF or file upload

    private String rawText; // For direct copy-paste

    public SyllabusUploadRequestDTO() {}

    public SyllabusUploadRequestDTO(String title, String subject, String rawText) {
        this.title = title;
        this.subject = subject;
        this.rawText = rawText;
        this.fileType = "TEXT";
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getBase64Content() {
        return base64Content;
    }

    public void setBase64Content(String base64Content) {
        this.base64Content = base64Content;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
}
