package com.webwizards.transformerApp.controller;

import com.webwizards.transformerApp.model.Transformer;
import com.webwizards.transformerApp.dto.InspectionRequest;
import com.webwizards.transformerApp.dto.InspectionResponse;
import com.webwizards.transformerApp.model.Inspection;
import com.webwizards.transformerApp.model.InspectionImage;
import com.webwizards.transformerApp.repository.TransformerRepository;
import com.webwizards.transformerApp.repository.InspectionImageRepository;
import com.webwizards.transformerApp.repository.InspectionRepository;

import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

import java.io.File;

import org.springframework.core.io.Resource;
// import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
import java.nio.file.Path;
// import java.nio.file.Paths;



@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class MainController {

    private final TransformerRepository transformerRepo;
    private final InspectionRepository inspectionRepo;
    private final InspectionImageRepository inspectionImageRepo; 

    public MainController(TransformerRepository transformerRepo, InspectionRepository inspectionRepo, InspectionImageRepository inspectionImageRepo) {
        this.transformerRepo = transformerRepo;
        this.inspectionRepo = inspectionRepo;
        this.inspectionImageRepo = inspectionImageRepo;
    }

    // ----------- TRANSFORMERS -------------
    @PostMapping("/transformers")
    public Transformer addTransformer(@RequestBody Transformer transformer) {
        return transformerRepo.save(transformer);
    }

    @PostMapping("/inspections")
    public InspectionResponse addInspection(@RequestBody InspectionRequest request) {
        Transformer transformer = transformerRepo.findByTransformerNo(request.getTransformerNo())
                .orElseThrow(() -> new RuntimeException("Transformer not found"));

        Inspection inspection = new Inspection();
        inspection.setTransformer(transformer);
        inspection.setDate(request.getDate());
        inspection.setTime(request.getTime());
        inspection.setStatus(request.getStatus() != null ? request.getStatus() : "Pending");
        inspection.setMaintenanceDate(request.getMaintenanceDate());

        Inspection saved = inspectionRepo.save(inspection);

        return new InspectionResponse(saved);
    }

    
    @GetMapping("/transformers")
    public List<Transformer> getTransformers() {
        return transformerRepo.findAll();
    }

    @GetMapping("/inspections")
    public List<InspectionResponse> getInspections() {
        return inspectionRepo.findAll()
                .stream()
                .map(InspectionResponse::new)
                .toList();
    }
    
    

    @PostMapping("/images")
    public InspectionImage uploadImage(
            @RequestParam("inspectionId") Long inspectionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "weather", required = false) String weather) throws IOException {
                
        Inspection inspection = inspectionRepo.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

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
        image.setWeather(weather);

        return inspectionImageRepo.save(image);
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<Resource> getImage(@PathVariable Long id) throws Exception {
        // 1. Find the image in DB
        InspectionImage image = inspectionImageRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // 2. Get the file path
        Path path = Paths.get(image.getFilePath());

        // 3. Load it as a Resource
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) {
            throw new RuntimeException("File not found on disk: " + image.getFilePath());
        }

        // 4. Return the file with correct content type
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(resource);
    }
}