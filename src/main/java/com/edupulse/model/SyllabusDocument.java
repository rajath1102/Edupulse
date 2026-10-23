package com.edupulse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "syllabus_documents")
public class SyllabusDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    private String fileName;

    private String fileType;

    private Long fileSize;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String rawText;

    private int chunkCount;

    private String uploadedBy;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SyllabusChunk> chunks = new ArrayList<>();

    public SyllabusDocument() {}

    public SyllabusDocument(String title, String subject, String fileName, String fileType, Long fileSize, String rawText, String uploadedBy) {
        this.title = title;
        this.subject = subject;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.rawText = rawText;
        this.uploadedBy = uploadedBy;
        this.createdAt = LocalDateTime.now();
    }

    public void addChunk(SyllabusChunk chunk) {
        chunks.add(chunk);
        chunk.setDocument(this);
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

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
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

    public List<SyllabusChunk> getChunks() {
        return chunks;
    }

    public void setChunks(List<SyllabusChunk> chunks) {
        this.chunks = chunks;
    }
}
