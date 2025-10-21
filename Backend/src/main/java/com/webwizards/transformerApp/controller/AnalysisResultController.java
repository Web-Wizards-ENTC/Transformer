package com.webwizards.transformerApp.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webwizards.transformerApp.model.InspectionBox;
import com.webwizards.transformerApp.repository.InspectionBoxRepository;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/analysis-results")
public class AnalysisResultController {

    private final InspectionBoxRepository boxRepository;

    public AnalysisResultController(InspectionBoxRepository boxRepository) {
        this.boxRepository = boxRepository;
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Map<String, Object> payload) {
        try {
            String inspectionId = payload.getOrDefault("inspectionId", "").toString();
            Object resultObj = payload.get("result");

            // Save each box as its own row if present into the single table `analysis_results`
            java.util.List<Long> savedIds = new java.util.ArrayList<>();
            try {
                Map<?,?> resultMap = (Map<?,?>) resultObj;
                Object boxInfoObj = resultMap.get("boxInfo");
                if (boxInfoObj instanceof java.util.List) {
                    java.util.List<?> boxes = (java.util.List<?>) boxInfoObj;
                    for (Object o : boxes) {
                        if (o instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String,Object> bi = (Map<String,Object>) o;
                            InspectionBox ib = new InspectionBox();
                            ib.setInspectionId(inspectionId);

                            Object xv = bi.get("x");
                            ib.setX(xv == null ? 0 : ((Number) xv).intValue());

                            Object yv = bi.get("y");
                            ib.setY(yv == null ? 0 : ((Number) yv).intValue());

                            Object wv = bi.get("w");
                            ib.setW(wv == null ? 0 : ((Number) wv).intValue());

                            Object hv = bi.get("h");
                            ib.setH(hv == null ? 0 : ((Number) hv).intValue());

                            Object af = bi.get("areaFrac");
                            ib.setAreaFrac(af == null ? 0.0 : ((Number) af).doubleValue());

                            Object asp = bi.get("aspect");
                            ib.setAspect(asp == null ? 0.0 : ((Number) asp).doubleValue());

                            Object ocf = bi.get("overlapCenterFrac");
                            ib.setOverlapCenterFrac(ocf == null ? 0.0 : ((Number) ocf).doubleValue());

                            Object lb = bi.get("label");
                            ib.setLabel(lb == null ? "" : lb.toString());

                            Object bf = bi.get("boxFault");
                            ib.setBoxFault(bf == null ? "" : bf.toString());

                            InspectionBox saved = boxRepository.save(ib);
                            if (saved != null && saved.getId() != null) savedIds.add(saved.getId());
                        }
                    }
                }
            } catch (Exception ex) {
                // non-fatal: continue
            }
            return ResponseEntity.ok(Map.of("savedBoxCount", savedIds.size(), "savedBoxIds", savedIds));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
