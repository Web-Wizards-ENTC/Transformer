package com.webwizards.transformerApp.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webwizards.transformerApp.model.Anomaly;
import com.webwizards.transformerApp.repository.AnomalyRepository;

@RestController
@RequestMapping("/api/anomalies")
public class AnomalyController {

    private final AnomalyRepository anomalyRepository;

    public AnomalyController(AnomalyRepository anomalyRepository) {
        this.anomalyRepository = anomalyRepository;
    }

    // POST /api/anomalies/insert
    @PostMapping("/insert")
    public ResponseEntity<?> insertAnomalies(@RequestBody Map<String, Object> body) {
        try {
            Object obj = body.get("anomalies");
            if (!(obj instanceof List)) {
                return ResponseEntity.badRequest().body(Map.of("error", "anomalies must be an array"));
            }

            List<?> arr = (List<?>) obj;
            List<Anomaly> saved = new ArrayList<>();

            for (Object o : arr) {
                if (!(o instanceof Map)) continue;
                Map<?, ?> m = (Map<?, ?>) o;
                Anomaly a = new Anomaly();
                a.setInspectionNumber(Objects.toString(m.get("inspection_number"), null));
                Object idxObj = m.get("index");
                if (idxObj == null) idxObj = m.get("idx");
                a.setIdx(idxObj == null ? null : Integer.valueOf(String.valueOf(idxObj)));
                a.setLabel(Objects.toString(m.get("label"), null));
                Object coords = m.get("coords");
                a.setCoords(coords == null ? null : coords.toString());
                Object conf = m.get("confidence");
                a.setConfidence(conf == null ? null : Float.valueOf(String.valueOf(conf)));
                a.setSeverity(Objects.toString(m.get("severity"), null));
                Object af = m.get("areaFrac");
                a.setAreaFrac(af == null ? null : Float.valueOf(String.valueOf(af)));
                Object im = m.get("isManual");
                a.setIsManual(im == null ? false : Boolean.valueOf(String.valueOf(im)));
                a.setCreatedBy(Objects.toString(m.get("createdBy"), null));
                a.setDeleted(false);
                a.setCreatedAt(LocalDateTime.now());

                saved.add(anomalyRepository.save(a));
            }

            return ResponseEntity.ok(Map.of("success", true, "inserted", saved.size()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    // DELETE /api/anomalies/delete (hard delete)
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAnomaly(@RequestBody Map<String, Object> body) {
        try {
            String inspectionNumber = Objects.toString(body.get("inspection_number"), null);
            Object idxObj = body.get("index");
            Integer idx = idxObj == null ? null : Integer.valueOf(String.valueOf(idxObj));
            if (inspectionNumber == null || idx == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "inspection_number and index required"));
            }

            List<Anomaly> found = anomalyRepository.findByInspectionNumberAndIdx(inspectionNumber, idx);
            if (found.isEmpty()) return ResponseEntity.ok(Map.of("success", true, "deleted", 0));

            anomalyRepository.deleteAll(found);
            return ResponseEntity.ok(Map.of("success", true, "deleted", found.size()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    // PATCH /api/anomalies/delete (soft delete)
    @PatchMapping("/delete")
    public ResponseEntity<?> softDeleteAnomaly(@RequestBody Map<String, Object> body) {
        try {
            String inspectionNumber = Objects.toString(body.get("inspection_number"), null);
            Object idxObj = body.get("index");
            Integer idx = idxObj == null ? null : Integer.valueOf(String.valueOf(idxObj));
            String deletedBy = Objects.toString(body.get("deletedBy"), null);
            if (inspectionNumber == null || idx == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "inspection_number and index required"));
            }

            List<Anomaly> found = anomalyRepository.findByInspectionNumberAndIdx(inspectionNumber, idx);
            if (found.isEmpty()) return ResponseEntity.ok(Map.of("success", true, "updated", 0));

            for (Anomaly a : found) {
                a.setDeleted(true);
                a.setDeletedAt(LocalDateTime.now());
                a.setDeletedBy(deletedBy);
            }
            anomalyRepository.saveAll(found);
            return ResponseEntity.ok(Map.of("success", true, "updated", found.size()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    // GET /api/anomalies/{inspectionNumber}
    @GetMapping("/{inspectionNumber}")
    public ResponseEntity<?> getByInspection(@PathVariable String inspectionNumber) {
        try {
            List<Anomaly> found = anomalyRepository.findByInspectionNumber(inspectionNumber);
            return ResponseEntity.ok(found);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }
}
