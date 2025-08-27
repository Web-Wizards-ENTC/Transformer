package com.webwizards.transformerApp.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class InspectionRequest {

    private String transformerNo;   // match frontend JSON
    private LocalDate date;
    private LocalTime time;
    private String status;
    private LocalDate maintenanceDate;

    // --- Getters & Setters ---
    public String getTransformerNo() {
        return transformerNo;
    }
    public void setTransformerNo(String transformerNo) {
        this.transformerNo = transformerNo;
    }

    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }
    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }
    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }
}
