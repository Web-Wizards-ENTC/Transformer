package com.webwizards.transformerApp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transformers")
public class Transformer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String region;
    private String transformerNo;
    private String poleNo;
    private String type;
    private String locationDetails;

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getTransformerNo() { return transformerNo; }
    public void setTransformerNo(String transformerNo) { this.transformerNo = transformerNo; }

    public String getPoleNo() { return poleNo; }
    public void setPoleNo(String poleNo) { this.poleNo = poleNo; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLocationDetails() { return locationDetails; }
    public void setLocationDetails(String locationDetails) { this.locationDetails = locationDetails; }
}
