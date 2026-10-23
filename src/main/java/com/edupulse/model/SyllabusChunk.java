package com.edupulse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "syllabus_chunks")
public class SyllabusChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore
    private SyllabusDocument document;

    private int chunkIndex;

    private String unitOrHeading;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private int tokenEstimate;

    public SyllabusChunk() {}

    public SyllabusChunk(int chunkIndex, String unitOrHeading, String content, int tokenEstimate) {
        this.chunkIndex = chunkIndex;
        this.unitOrHeading = unitOrHeading;
        this.content = content;
        this.tokenEstimate = tokenEstimate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SyllabusDocument getDocument() {
        return document;
    }

    public void setDocument(SyllabusDocument document) {
        this.document = document;
    }

    public int getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(int chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getUnitOrHeading() {
        return unitOrHeading;
    }

    public void setUnitOrHeading(String unitOrHeading) {
        this.unitOrHeading = unitOrHeading;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getTokenEstimate() {
        return tokenEstimate;
    }

    public void setTokenEstimate(int tokenEstimate) {
        this.tokenEstimate = tokenEstimate;
    }
}
