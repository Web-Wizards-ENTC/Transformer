package com.webwizards.transformerApp.dto;

public class InspectionRequest {
    private Long transformerId;   // <-- user will send this
    private String inspectorName;
    private String notes;

    // Getters and setters
    public Long getTransformerId() { return transformerId; }
    public void setTransformerId(Long transformerId) { this.transformerId = transformerId; }

    public String getInspectorName() { return inspectorName; }
    public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
