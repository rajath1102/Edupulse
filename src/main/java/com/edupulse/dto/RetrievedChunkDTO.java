package com.edupulse.dto;

public class RetrievedChunkDTO {

    private Long id;
    private int chunkIndex;
    private String unitOrHeading;
    private String content;
    private double relevanceScore;

    public RetrievedChunkDTO() {}

    public RetrievedChunkDTO(Long id, int chunkIndex, String unitOrHeading, String content, double relevanceScore) {
        this.id = id;
        this.chunkIndex = chunkIndex;
        this.unitOrHeading = unitOrHeading;
        this.content = content;
        this.relevanceScore = relevanceScore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }
}
