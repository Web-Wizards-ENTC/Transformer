package com.webwizards.transformerApp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String branch;
    private String transformerNo;   // transformer reference number
    private String date;            // you could also use LocalDate
    private String time;            // you could also use LocalTime
    private String status;
    private String maintainanceDate;

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getTransformerNo() { return transformerNo; }
    public void setTransformerNo(String transformerNo) { this.transformerNo = transformerNo; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMaintainanceDate() { return maintainanceDate; }
    public void setMaintainanceDate(String maintainanceDate) { this.maintainanceDate = maintainanceDate; }
}