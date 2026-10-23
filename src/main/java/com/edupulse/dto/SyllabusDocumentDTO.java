package com.edupulse.dto;

import java.time.LocalDateTime;

public class SyllabusDocumentDTO {

    private Long id;
    private String title;
    private String subject;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private int chunkCount;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private String previewText;

    public SyllabusDocumentDTO() {}

    public SyllabusDocumentDTO(Long id, String title, String subject, String fileName, String fileType, Long fileSize, int chunkCount, String uploadedBy, LocalDateTime createdAt, String previewText) {
        this.id = id;
        this.title = title;
        this.subject = subject;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.chunkCount = chunkCount;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt;
        this.previewText = previewText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public int getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(int chunkCount) {
        this.chunkCount = chunkCount;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPreviewText() {
        return previewText;
    }

    public void setPreviewText(String previewText) {
        this.previewText = previewText;
    }
}
