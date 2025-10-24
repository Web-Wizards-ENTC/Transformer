package com.webwizards.transformerApp.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webwizards.transformerApp.dto.MLPredictionRequest;
import com.webwizards.transformerApp.dto.MLPredictionResponse;

@Service
public class PythonMLService {
    
    private final ObjectMapper objectMapper;
    private static final String PYTHON_SCRIPT_DIR = "Backend/ml_models/";
    private static final String ANALYZE_SCRIPT = "analyze.py";
    
    public PythonMLService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    /**
     * Calls the Python thermal analysis script with baseline and candidate images
     * @param request The prediction request containing baseline and candidate image paths
     * @return The thermal analysis response from the Python script
     */
    public MLPredictionResponse analyzeThermalImages(MLPredictionRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Validate that we have both baseline and candidate images
            if (request.getBaselineImagePath() == null || request.getBaselineImagePath().trim().isEmpty()) {
                return MLPredictionResponse.error("Baseline image path is required for thermal analysis");
            }
            
            if (request.getCandidateImagePath() == null || request.getCandidateImagePath().trim().isEmpty()) {
                return MLPredictionResponse.error("Candidate image path is required for thermal analysis");
            }
            
            // Check if both image files exist
            Path baselinePath = Paths.get(request.getBaselineImagePath());
            Path candidatePath = Paths.get(request.getCandidateImagePath());
            
            if (!baselinePath.toFile().exists()) {
                return MLPredictionResponse.error("Baseline image file not found: " + request.getBaselineImagePath());
            }
            
            if (!candidatePath.toFile().exists()) {
                return MLPredictionResponse.error("Candidate image file not found: " + request.getCandidateImagePath());
            }
            
            // Resolve the analyze.py script path robustly to avoid duplicated folders
            ProcessBuilder processBuilder = new ProcessBuilder();
            Path cwd = Paths.get(System.getProperty("user.dir"));

            // Try a few candidate locations (project may be run with different working directories)
            Path scriptPath = cwd.resolve("ml_models").resolve(ANALYZE_SCRIPT);
            if (!Files.exists(scriptPath)) {
                scriptPath = cwd.resolve("Backend").resolve("ml_models").resolve(ANALYZE_SCRIPT);
            }
            if (!Files.exists(scriptPath)) {
                scriptPath = cwd.resolve("ML Model").resolve(ANALYZE_SCRIPT);
            }

            if (!Files.exists(scriptPath)) {
                return MLPredictionResponse.error("Analyze script not found. Checked: " +
                    cwd.resolve("ml_models").resolve(ANALYZE_SCRIPT).toString() + ", " +
                    cwd.resolve("Backend").resolve("ml_models").resolve(ANALYZE_SCRIPT).toString() + ", " +
                    cwd.resolve("ML Model").resolve(ANALYZE_SCRIPT).toString());
            }

            // Use absolute path when invoking Python to avoid relative-path duplication
            processBuilder.command(
                "python",
                scriptPath.toAbsolutePath().toString(),
                request.getBaselineImagePath(),
                request.getCandidateImagePath()
            );

            // Keep the process working directory at the application's cwd
            processBuilder.directory(cwd.toFile());

            Process process = processBuilder.start();
            
            // Read the output
            String output = readProcessOutput(process.getInputStream());
            String error = readProcessOutput(process.getErrorStream());
            
            // Wait for the process to complete
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            
            if (!finished) {
                process.destroyForcibly();
                return MLPredictionResponse.error("Python script execution timed out");
            }
            
            int exitCode = process.exitValue();
            long processingTime = System.currentTimeMillis() - startTime;
            
            if (exitCode != 0) {
                return createErrorResponse("Python script failed with exit code " + exitCode + ": " + error, processingTime);
            }
            
            // Parse the JSON output from Python
            return parseThermalAnalysisResponse(output, processingTime);
            
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            return createErrorResponse("Error executing thermal analysis: " + e.getMessage(), processingTime);
        }
    }
    
    /**
     * Calls the Python ML model with the given request (legacy method for backward compatibility)
     * @param request The prediction request containing image path and parameters
     * @return The prediction response from the Python model
     */
    public MLPredictionResponse predict(MLPredictionRequest request) {
        // If this is a thermal analysis request, delegate to the thermal analysis method
        if ("thermal_analysis".equals(request.getModelType()) || 
            (request.getBaselineImagePath() != null && request.getCandidateImagePath() != null)) {
            return analyzeThermalImages(request);
        }
        
        // Legacy single image prediction - for backward compatibility
        return predictSingleImage(request);
    }
    
    /**
     * Legacy single image prediction method
     */
    private MLPredictionResponse predictSingleImage(MLPredictionRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Validate input
            if (request.getImagePath() == null || request.getImagePath().trim().isEmpty()) {
                return MLPredictionResponse.error("Image path is required");
            }
            
            // Check if image file exists
            Path imagePath = Paths.get(request.getImagePath());
            if (!imagePath.toFile().exists()) {
                return MLPredictionResponse.error("Image file not found: " + request.getImagePath());
            }
            
            // For single image, we can't do thermal analysis, return a simple response
            long processingTime = System.currentTimeMillis() - startTime;
            MLPredictionResponse response = new MLPredictionResponse();
            response.setSuccess(true);
            response.setPrediction("Single image analysis not supported. Use thermal analysis with baseline and candidate images.");
            response.setConfidence(0.0);
            response.setProcessingTimeMs(processingTime);
            return response;
            
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            return createErrorResponse("Error in single image prediction: " + e.getMessage(), processingTime);
        }
    }
    
    /**
     * Builds the command to execute the thermal analysis Python script
     */
    private String buildThermalAnalysisCommand(MLPredictionRequest request) {
        StringBuilder command = new StringBuilder();
        command.append("python ").append(PYTHON_SCRIPT_DIR).append(ANALYZE_SCRIPT);
        command.append(" \"").append(request.getBaselineImagePath()).append("\"");
        command.append(" \"").append(request.getCandidateImagePath()).append("\"");
        return command.toString();
    }
    
    /**
     * Builds the command to execute the Python script (legacy method)
     */
    private String buildPythonCommand(MLPredictionRequest request) {
        // This method is kept for backward compatibility but analyze.py is now the primary script
        return buildThermalAnalysisCommand(request);
    }
    
    /**
     * Reads output from a process stream
     */
    private String readProcessOutput(InputStream inputStream) throws IOException {
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString().trim();
    }
    
    /**
     * Parses the JSON response from the thermal analysis Python script
     */
    private MLPredictionResponse parseThermalAnalysisResponse(String output, long processingTime) {
        try {
            JsonNode jsonNode = objectMapper.readTree(output);
            
            // Check for error in response
            if (jsonNode.has("error")) {
                return createErrorResponse("Python script error: " + jsonNode.path("error").asText(), processingTime);
            }
            
            MLPredictionResponse response = new MLPredictionResponse();
            response.setSuccess(true);
            response.setProcessingTimeMs(processingTime);
            
            // Extract thermal analysis specific fields
            response.setProb(jsonNode.path("prob").asDouble());
            response.setHistDistance(jsonNode.path("histDistance").asDouble());
            response.setDv95(jsonNode.path("dv95").asDouble());
            response.setWarmFraction(jsonNode.path("warmFraction").asDouble());
            response.setImageWidth(jsonNode.path("imageWidth").asInt());
            response.setImageHeight(jsonNode.path("imageHeight").asInt());
            response.setFaultType(jsonNode.path("faultType").asText());
            response.setAnnotated(jsonNode.path("annotated").asText());
            
            // Set prediction and confidence based on fault type and probability
            response.setPrediction(response.getFaultType() != null ? response.getFaultType() : "unknown");
            response.setConfidence(response.getProb() != null ? response.getProb() : 0.0);
            
            // Parse boxes array
            if (jsonNode.has("boxes") && jsonNode.get("boxes").isArray()) {
                java.util.List<java.util.List<Integer>> boxes = new java.util.ArrayList<>();
                for (JsonNode boxNode : jsonNode.get("boxes")) {
                    if (boxNode.isArray() && boxNode.size() >= 4) {
                        java.util.List<Integer> box = new java.util.ArrayList<>();
                        for (int i = 0; i < 4; i++) {
                            box.add(boxNode.get(i).asInt());
                        }
                        boxes.add(box);
                    }
                }
                response.setBoxes(boxes);
            }
            
            // Parse boxInfo array
            if (jsonNode.has("boxInfo") && jsonNode.get("boxInfo").isArray()) {
                java.util.List<Map<String, Object>> boxInfo = new java.util.ArrayList<>();
                for (JsonNode infoNode : jsonNode.get("boxInfo")) {
                    Map<String, Object> info = objectMapper.convertValue(infoNode,
                        objectMapper.getTypeFactory().constructMapType(
                            java.util.Map.class, String.class, Object.class));
                    boxInfo.add(info);
                }
                response.setBoxInfo(boxInfo);
            }
            
            // Set metadata with additional information
            Map<String, Object> metadata = new java.util.HashMap<>();
            metadata.put("analysisType", "thermal_comparison");
            metadata.put("scriptUsed", ANALYZE_SCRIPT);
            if (jsonNode.has("imageWidth")) metadata.put("imageWidth", jsonNode.get("imageWidth").asInt());
            if (jsonNode.has("imageHeight")) metadata.put("imageHeight", jsonNode.get("imageHeight").asInt());
            response.setMetadata(metadata);
            
            return response;
            
        } catch (Exception e) {
            return createErrorResponse("Failed to parse thermal analysis response: " + e.getMessage() + 
                                     ". Raw output: " + output, processingTime);
        }
    }
    
    /**
     * Parses the JSON response from the Python ML model (legacy method)
     */
    private MLPredictionResponse parseMLResponse(String output, long processingTime) {
        try {
            JsonNode jsonNode = objectMapper.readTree(output);
            
            MLPredictionResponse response = new MLPredictionResponse();
            response.setSuccess(jsonNode.path("success").asBoolean(false));
            response.setPrediction(jsonNode.path("prediction").asText());
            response.setConfidence(jsonNode.path("confidence").asDouble(0.0));
            response.setProcessingTimeMs(processingTime);
            
            // Parse metadata if present
            if (jsonNode.has("metadata")) {
                response.setMetadata(objectMapper.convertValue(jsonNode.get("metadata"), 
                    objectMapper.getTypeFactory().constructMapType(
                        java.util.Map.class, String.class, Object.class)));
            }
            
            if (!response.isSuccess() && jsonNode.has("error")) {
                response.setErrorMessage(jsonNode.path("error").asText());
            }
            
            return response;
            
        } catch (Exception e) {
            return createErrorResponse("Failed to parse Python model response: " + e.getMessage() + 
                                     ". Raw output: " + output, processingTime);
        }
    }
    
    /**
     * Creates an error response with processing time
     */
    private MLPredictionResponse createErrorResponse(String errorMessage, long processingTime) {
        MLPredictionResponse response = MLPredictionResponse.error(errorMessage);
        response.setProcessingTimeMs(processingTime);
        return response;
    }
    
    /**
     * Predicts using an uploaded image file
     */
    public MLPredictionResponse predictFromUploadedImage(String fileName, String modelType) {
        String imagePath = System.getProperty("user.dir") + "/uploads/" + fileName;
        
        MLPredictionRequest request = new MLPredictionRequest();
        request.setImagePath(imagePath);
        request.setModelType(modelType);
        
        return predict(request);
    }
}