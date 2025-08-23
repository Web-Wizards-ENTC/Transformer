package com.webwizards.transformerApp.model;

public class Transformer {
    private Long id;
    private String transformerId;
    private String location;
    private String capacity;

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getTransformerId() {
        return transformerId;
    }
    public void setTransformerId(String transformerId) {
        this.transformerId = transformerId;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public String getCapacity() {
        return capacity;
    }
    public void setCapacity(String capacity) {
        this.capacity = capacity;
    }
}
