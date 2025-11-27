package com.webwizards.transformerApp.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.webwizards.transformerApp.dto.InspectionRequest;
import com.webwizards.transformerApp.dto.MLPredictionRequest;
import com.webwizards.transformerApp.dto.MLPredictionResponse;
import com.webwizards.transformerApp.model.Inspection;
import com.webwizards.transformerApp.model.InspectionImage;
import com.webwizards.transformerApp.model.Transformer;
import com.webwizards.transformerApp.repository.InspectionImageRepository;
import com.webwizards.transformerApp.repository.InspectionRepository;
import com.webwizards.transformerApp.repository.TransformerRepository;
import com.webwizards.transformerApp.service.PythonMLService;
// import java.nio.file.Paths;

// Add imports for new models and repositories
import com.webwizards.transformerApp.model.GeneralRecord;
import com.webwizards.transformerApp.model.MaintenanceRecord;
import com.webwizards.transformerApp.model.WorkDataSheet;
import com.webwizards.transformerApp.repository.GeneralRecordRepository;
import com.webwizards.transformerApp.repository.MaintenanceRecordRepository;
import com.webwizards.transformerApp.repository.WorkDataSheetRepository;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class MainController {

    private final TransformerRepository transformerRepo;
    private final InspectionRepository inspectionRepo;
    private final InspectionImageRepository inspectionImageRepo;
    private final PythonMLService pythonMLService;
    private final GeneralRecordRepository generalRecordRepo;
    private final MaintenanceRecordRepository maintenanceRecordRepo;
    private final WorkDataSheetRepository workDataSheetRepo;

    public MainController(TransformerRepository transformerRepo, InspectionRepository inspectionRepo, 
                         InspectionImageRepository inspectionImageRepo, PythonMLService pythonMLService,
                         GeneralRecordRepository generalRecordRepo, MaintenanceRecordRepository maintenanceRecordRepo,
                         WorkDataSheetRepository workDataSheetRepo) {
        this.transformerRepo = transformerRepo;
        this.inspectionRepo = inspectionRepo;
        this.inspectionImageRepo = inspectionImageRepo;
        this.pythonMLService = pythonMLService;
        this.generalRecordRepo = generalRecordRepo;
        this.maintenanceRecordRepo = maintenanceRecordRepo;
        this.workDataSheetRepo = workDataSheetRepo;
    }

    // ----------- TRANSFORMERS -------------
    @PostMapping("/transformers")
    public Transformer addTransformer(@RequestBody Transformer transformer) {
        if (transformer == null) {
            throw new IllegalArgumentException("Transformer data cannot be null");
        }
        return transformerRepo.save(transformer);
    }

    @GetMapping("/transformers")
    public List<Transformer> getTransformers() {
        return transformerRepo.findAll();
    }

    @PostMapping("/inspections")
    public Inspection addInspection(@RequestBody InspectionRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Inspection request cannot be null");
        }
        // Create a new Inspection
        Inspection inspection = new Inspection();
        inspection.setBranch(request.getBranch());
        inspection.setTransformerNo(request.getTransformerNo());
        inspection.setDate(request.getDate());
        inspection.setTime(request.getTime());
        inspection.setStatus(request.getStatus());
        inspection.setMaintainanceDate(request.getMaintainanceDate());
        // Save into DB
        return inspectionRepo.save(inspection);
    }
    

    @GetMapping("/inspections")
    public List<Inspection> getInspections() {
        return inspectionRepo.findAll();
    }

    @PostMapping("/images")
    public InspectionImage uploadImage(
            @RequestParam("inspectionId") Long inspectionId,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (inspectionId == null) {
            throw new IllegalArgumentException("Inspection ID cannot be null");
        }

        Inspection inspection = inspectionRepo.findById(inspectionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspection not found"));

        // Create uploads folder if not exists
        String folder = System.getProperty("user.dir") + "/uploads/";
        File uploadDir = new File(folder);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        // Save file to disk
        String filePath = folder + file.getOriginalFilename();
        file.transferTo(new File(filePath));

        // Save metadata in DB
        InspectionImage image = new InspectionImage();
        image.setFileName(file.getOriginalFilename());
        image.setFilePath(filePath);
        image.setContentType(file.getContentType());
        image.setInspection(inspection);

        return inspectionImageRepo.save(image);
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<Resource> getImage(@PathVariable Long id) throws Exception {
        if (id == null) {
            throw new IllegalArgumentException("Image ID cannot be null");
        }

        InspectionImage image = inspectionImageRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Image not found"));

        Path path = Paths.get(image.getFilePath());
        if (path == null) {
            throw new IllegalArgumentException("File path cannot be null");
        }

        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) {
            throw new IllegalArgumentException("File not found on disk: " + image.getFilePath());
        }

        String contentType = image.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("Content type cannot be null");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // ----------- ML PREDICTIONS -------------
    
    @PostMapping("/ml/predict")
    public ResponseEntity<MLPredictionResponse> predict(@RequestBody MLPredictionRequest request) {
        try {
            MLPredictionResponse response = pythonMLService.predict(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error("Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PostMapping("/ml/predict-image/{imageId}")
    public ResponseEntity<MLPredictionResponse> predictFromImage(
            @PathVariable Long imageId,
            @RequestParam(value = "modelType", defaultValue = "default") String modelType) {
        try {
            // Find the image in DB
            InspectionImage image = inspectionImageRepo.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Image not found"));
            
            // Use the service to predict
            MLPredictionRequest request = new MLPredictionRequest();
            request.setImagePath(image.getFilePath());
            request.setModelType(modelType);
            
            MLPredictionResponse response = pythonMLService.predict(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error(e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error("Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PostMapping("/ml/predict-upload")
    public ResponseEntity<MLPredictionResponse> predictFromUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "modelType", defaultValue = "default") String modelType) throws IOException {
        try {
            // Save file temporarily
            String folder = System.getProperty("user.dir") + "/uploads/";
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) uploadDir.mkdirs();
            
            String fileName = "temp_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = folder + fileName;
            file.transferTo(new File(filePath));
            
            // Predict using the uploaded file
            MLPredictionResponse response = pythonMLService.predictFromUploadedImage(fileName, modelType);
            
            // Clean up temporary file
            new File(filePath).delete();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error("Error processing upload: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    // ----------- THERMAL ANALYSIS ENDPOINTS -------------
    
    @PostMapping("/thermal/analyze")
    public ResponseEntity<MLPredictionResponse> analyzeThermalImages(@RequestBody MLPredictionRequest request) {
        try {
            MLPredictionResponse response = pythonMLService.analyzeThermalImages(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error("Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PostMapping("/thermal/analyze-images/{baselineId}/{candidateId}")
    public ResponseEntity<MLPredictionResponse> analyzeThermalImagesById(
            @PathVariable Long baselineId,
            @PathVariable Long candidateId) {

        if (baselineId == null || candidateId == null) {
            throw new IllegalArgumentException("Baseline ID and Candidate ID cannot be null");
        }

        InspectionImage baselineImage = inspectionImageRepo.findById(baselineId)
                .orElseThrow(() -> new IllegalArgumentException("Baseline image not found"));

        InspectionImage candidateImage = inspectionImageRepo.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate image not found"));

        if (baselineImage.getFilePath() == null || candidateImage.getFilePath() == null) {
            throw new IllegalArgumentException("File paths for images cannot be null");
        }

        MLPredictionRequest request = new MLPredictionRequest();
        request.setBaselineImagePath(baselineImage.getFilePath());
        request.setCandidateImagePath(candidateImage.getFilePath());
        request.setModelType("thermal_analysis");

        MLPredictionResponse response = pythonMLService.analyzeThermalImages(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/thermal/analyze-upload")
    public ResponseEntity<MLPredictionResponse> analyzeThermalImagesFromUpload(
            @RequestParam("baselineFile") MultipartFile baselineFile,
            @RequestParam("candidateFile") MultipartFile candidateFile) throws IOException {
        try {
            // Save both files temporarily
            String folder = System.getProperty("user.dir") + "/uploads/";
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) uploadDir.mkdirs();
            
            String timestamp = String.valueOf(System.currentTimeMillis());
            String baselineFileName = "baseline_" + timestamp + "_" + baselineFile.getOriginalFilename();
            String candidateFileName = "candidate_" + timestamp + "_" + candidateFile.getOriginalFilename();
            
            String baselineFilePath = folder + baselineFileName;
            String candidateFilePath = folder + candidateFileName;
            
            baselineFile.transferTo(new File(baselineFilePath));
            candidateFile.transferTo(new File(candidateFilePath));
            
            // Create thermal analysis request
            MLPredictionRequest request = new MLPredictionRequest();
            request.setBaselineImagePath(baselineFilePath);
            request.setCandidateImagePath(candidateFilePath);
            request.setModelType("thermal_analysis");
            
            // Perform thermal analysis
            MLPredictionResponse response = pythonMLService.analyzeThermalImages(request);
            
            // Clean up temporary files
            new File(baselineFilePath).delete();
            new File(candidateFilePath).delete();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error("Error processing thermal analysis upload: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PostMapping("/thermal/analyze-with-baseline/{candidateId}")
    public ResponseEntity<MLPredictionResponse> analyzeThermalImageWithBaseline(
            @PathVariable Long candidateId,
            @RequestParam("baselineFile") MultipartFile baselineFile) throws IOException {
        try {
            // Find candidate image in DB
            InspectionImage candidateImage = inspectionImageRepo.findById(candidateId)
                    .orElseThrow(() -> new IllegalArgumentException("Candidate image not found"));
            
            // Save baseline file temporarily
            String folder = System.getProperty("user.dir") + "/uploads/";
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) uploadDir.mkdirs();
            
            String baselineFileName = "baseline_" + System.currentTimeMillis() + "_" + baselineFile.getOriginalFilename();
            String baselineFilePath = folder + baselineFileName;
            baselineFile.transferTo(new File(baselineFilePath));
            
            // Create thermal analysis request
            MLPredictionRequest request = new MLPredictionRequest();
            request.setBaselineImagePath(baselineFilePath);
            request.setCandidateImagePath(candidateImage.getFilePath());
            request.setModelType("thermal_analysis");
            
            // Perform thermal analysis
            MLPredictionResponse response = pythonMLService.analyzeThermalImages(request);
            
            // Clean up temporary baseline file
            new File(baselineFilePath).delete();
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error(e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            MLPredictionResponse errorResponse = MLPredictionResponse.error("Error processing thermal analysis: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Endpoint to add General Record
    @PostMapping("/general-records")
    public GeneralRecord addGeneralRecord(@RequestBody GeneralRecord generalRecord) {
        if (generalRecord == null) {
            throw new IllegalArgumentException("General record cannot be null");
        }
        return generalRecordRepo.save(generalRecord);
    }

    // Endpoint to add Maintenance Record
    @PostMapping("/maintenance-records")
    public MaintenanceRecord addMaintenanceRecord(@RequestBody MaintenanceRecord maintenanceRecord) {
        if (maintenanceRecord == null) {
            throw new IllegalArgumentException("Maintenance record cannot be null");
        }
        return maintenanceRecordRepo.save(maintenanceRecord);
    }

    // Endpoint to add Work Data Sheet
    @PostMapping("/work-data-sheets")
    public WorkDataSheet addWorkDataSheet(@RequestBody WorkDataSheet workDataSheet) {
        if (workDataSheet == null) {
            throw new IllegalArgumentException("Work data sheet cannot be null");
        }
        return workDataSheetRepo.save(workDataSheet);
    }
}