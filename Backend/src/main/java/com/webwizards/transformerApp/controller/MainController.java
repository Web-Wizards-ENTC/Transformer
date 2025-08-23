package com.webwizards.transformerApp.controller;

import com.webwizards.transformerApp.model.Transformer;
import com.webwizards.transformerApp.dto.InspectionRequest;
import com.webwizards.transformerApp.model.Inspection;
import com.webwizards.transformerApp.model.InspectionImage;
import com.webwizards.transformerApp.repository.TransformerRepository;
import com.webwizards.transformerApp.repository.InspectionImageRepository;
import com.webwizards.transformerApp.repository.InspectionRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import java.io.File;


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

    @GetMapping("/transformers")
    public List<Transformer> getTransformers() {
        return transformerRepo.findAll();
    }

    @PostMapping("/inspections")
    public Inspection addInspection(@RequestBody InspectionRequest request) {
        // 1. Find the transformer by id
        Transformer transformer = transformerRepo.findById(request.getTransformerId())
                .orElseThrow(() -> new RuntimeException("Transformer not found"));

        // 2. Create a new Inspection
        Inspection inspection = new Inspection();
        inspection.setInspectorName(request.getInspectorName());
        inspection.setNotes(request.getNotes());

        // 3. Link it to the transformer
        inspection.setTransformer(transformer);

        // 4. Save into DB
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

        return inspectionImageRepo.save(image);
    }
}
