package com.edupulse.dto;

import jakarta.validation.constraints.NotBlank;

public class ScanMarksRequestDTO {

    @NotBlank(message = "Image Base64 content cannot be blank")
    private String imageBase64;

    private String mimeType;

    public ScanMarksRequestDTO() {
    }

    public ScanMarksRequestDTO(String imageBase64, String mimeType) {
        this.imageBase64 = imageBase64;
        this.mimeType = mimeType;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
}
