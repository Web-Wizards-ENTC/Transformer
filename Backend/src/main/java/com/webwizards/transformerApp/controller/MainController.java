package com.webwizards.transformerApp.controller;

import com.webwizards.transformerApp.model.Transformer;
import com.webwizards.transformerApp.dto.InspectionRequest;
import com.webwizards.transformerApp.model.Inspection;
import com.webwizards.transformerApp.repository.TransformerRepository;
import com.webwizards.transformerApp.repository.InspectionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MainController {

    private final TransformerRepository transformerRepo;
    private final InspectionRepository inspectionRepo;

    public MainController(TransformerRepository transformerRepo, InspectionRepository inspectionRepo) {
        this.transformerRepo = transformerRepo;
        this.inspectionRepo = inspectionRepo;
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
}
