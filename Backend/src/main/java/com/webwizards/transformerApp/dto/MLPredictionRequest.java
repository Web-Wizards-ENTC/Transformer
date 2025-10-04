package com.webwizards.transformerApp.dto;

import java.util.Map;

import lombok.Data;

@Data
public class MLPredictionRequest {
    private String baselineImagePath;  // For thermal analysis - baseline image
    private String candidateImagePath; // For thermal analysis - candidate image
    private String imagePath;          // For backward compatibility
    private Map<String, Object> parameters;
    private String modelType;
    
    public MLPredictionRequest() {}
    
    public MLPredictionRequest(String imagePath, Map<String, Object> parameters, String modelType) {
        this.imagePath = imagePath;
        this.parameters = parameters;
        this.modelType = modelType;
    }
    
    // Constructor for thermal analysis
    public MLPredictionRequest(String baselineImagePath, String candidateImagePath, Map<String, Object> parameters) {
        this.baselineImagePath = baselineImagePath;
        this.candidateImagePath = candidateImagePath;
        this.parameters = parameters;
        this.modelType = "thermal_analysis";
    }
}