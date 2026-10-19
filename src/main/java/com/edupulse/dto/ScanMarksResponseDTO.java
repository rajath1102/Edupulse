package com.edupulse.dto;

import java.util.List;

public class ScanMarksResponseDTO {

    private List<ScannedRecordDTO> records;
    private int totalDetected;
    private int totalMatched;
    private String aiSource;
    private String message;

    public ScanMarksResponseDTO() {
    }

    public ScanMarksResponseDTO(List<ScannedRecordDTO> records, int totalDetected, int totalMatched, String aiSource, String message) {
        this.records = records;
        this.totalDetected = totalDetected;
        this.totalMatched = totalMatched;
        this.aiSource = aiSource;
        this.message = message;
    }

    public List<ScannedRecordDTO> getRecords() {
        return records;
    }

    public void setRecords(List<ScannedRecordDTO> records) {
        this.records = records;
    }

    public int getTotalDetected() {
        return totalDetected;
    }

    public void setTotalDetected(int totalDetected) {
        this.totalDetected = totalDetected;
    }

    public int getTotalMatched() {
        return totalMatched;
    }

    public void setTotalMatched(int totalMatched) {
        this.totalMatched = totalMatched;
    }

    public String getAiSource() {
        return aiSource;
    }

    public void setAiSource(String aiSource) {
        this.aiSource = aiSource;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
