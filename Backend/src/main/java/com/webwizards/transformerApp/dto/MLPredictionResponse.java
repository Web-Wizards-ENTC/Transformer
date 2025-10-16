package com.webwizards.transformerApp.dto;

import java.util.Map;

import lombok.Data;

@Data
public class MLPredictionResponse {
    private boolean success;
    private String prediction;
    private double confidence;
    private Map<String, Object> metadata;
    private String errorMessage;
    private long processingTimeMs;
    
    // Thermal analysis specific fields
    private Double prob;                    // Probability from analyze.py
    private Double histDistance;            // Histogram distance
    private Double dv95;                   // 95th percentile brightness change
    private Double warmFraction;           // Fraction of warm pixels
    private Integer imageWidth;
    private Integer imageHeight;
    private java.util.List<java.util.List<Integer>> boxes;  // Bounding boxes [x, y, w, h]
    private java.util.List<Map<String, Object>> boxInfo;    // Detailed box information
    private String faultType;              // Type of fault detected
    private String annotated;              // Base64 annotated image (if provided)
    
    public MLPredictionResponse() {}
    
    public MLPredictionResponse(boolean success, String prediction, double confidence) {
        this.success = success;
        this.prediction = prediction;
        this.confidence = confidence;
    }
    
    public static MLPredictionResponse success(String prediction, double confidence) {
        MLPredictionResponse response = new MLPredictionResponse();
        response.setSuccess(true);
        response.setPrediction(prediction);
        response.setConfidence(confidence);
        return response;
    }
    
    public static MLPredictionResponse error(String errorMessage) {
        MLPredictionResponse response = new MLPredictionResponse();
        response.setSuccess(false);
        response.setErrorMessage(errorMessage);
        return response;
    }
}