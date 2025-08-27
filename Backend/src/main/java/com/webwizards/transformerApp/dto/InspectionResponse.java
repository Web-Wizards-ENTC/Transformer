package com.webwizards.transformerApp.dto;

import com.webwizards.transformerApp.model.Inspection;
import java.time.LocalDate;
import java.time.LocalTime;

public class InspectionResponse {
    private Long id;                  // maps inspectionId
    private String transformerNo;     // flattened from Transformer entity
    private LocalDate date;
    private LocalTime time;
    private String status;
    private LocalDate maintenanceDate;

    // Constructor that builds response from entity
    public InspectionResponse(Inspection inspection) {
        this.id = inspection.getInspectionId();
        this.transformerNo = inspection.getTransformer().getTransformerNo();
        this.date = inspection.getDate();
        this.time = inspection.getTime();
        this.status = inspection.getStatus();
        this.maintenanceDate = inspection.getMaintenanceDate();
    }

    // --- Getters ---
    public Long getId() { return id; }
    public String getTransformerNo() { return transformerNo; }
    public LocalDate getDate() { return date; }
    public LocalTime getTime() { return time; }
    public String getStatus() { return status; }
    public LocalDate getMaintenanceDate() { return maintenanceDate; }
}
