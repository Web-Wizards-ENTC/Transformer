package com.webwizards.transformerApp.model;   

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "transformers")
public class Transformer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transformerId;
    private String location;
    private String capacity;
    private String manufacturer;

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransformerId() { return transformerId; }
    public void setTransformerId(String transformerId) { this.transformerId = transformerId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCapacity() { return capacity; }
    public void setCapacity(String capacity) { this.capacity = capacity; }

    // getters & setters
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
}
