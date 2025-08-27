package com.webwizards.transformerApp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transformers")
public class Transformer {

    @Id
    @Column(name = "transformer_no", length = 50)
    private String transformerNo;   // Primary key

    private String region;
    private String poleNo;
    private String type;
    private String locationDetails;

    // --- Getters & Setters ---
    public String getTransformerNo() { return transformerNo; }
    public void setTransformerNo(String transformerNo) { this.transformerNo = transformerNo; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getPoleNo() { return poleNo; }
    public void setPoleNo(String poleNo) { this.poleNo = poleNo; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLocationDetails() { return locationDetails; }
    public void setLocationDetails(String locationDetails) { this.locationDetails = locationDetails; }
}
