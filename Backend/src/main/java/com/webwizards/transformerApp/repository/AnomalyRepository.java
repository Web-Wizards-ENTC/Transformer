package com.webwizards.transformerApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webwizards.transformerApp.model.Anomaly;

public interface AnomalyRepository extends JpaRepository<Anomaly, Long> {
    List<Anomaly> findByInspectionNumberAndIdx(String inspectionNumber, Integer idx);
    List<Anomaly> findByInspectionNumber(String inspectionNumber);
}
