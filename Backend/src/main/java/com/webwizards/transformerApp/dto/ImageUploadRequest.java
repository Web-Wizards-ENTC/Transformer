package com.webwizards.transformerApp.dto;

public class ImageUploadRequest {
    private Long inspectionId;
    private String description; // optional extra metadata

    public Long getInspectionId() { return inspectionId; }
    public void setInspectionId(Long inspectionId) { this.inspectionId = inspectionId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
