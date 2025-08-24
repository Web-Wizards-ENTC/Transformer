package com.webwizards.transformerApp.dto;

public class InspectionRequest {
    private String branch;
    private String transformerNo;
    private String date;
    private String time;

    // --- Getters and Setters ---
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getTransformerNo() { return transformerNo; }
    public void setTransformerNo(String transformerNo) { this.transformerNo = transformerNo; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}