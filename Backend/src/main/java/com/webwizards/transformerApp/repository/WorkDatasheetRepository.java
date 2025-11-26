package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.WorkDatasheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkDatasheetRepository extends JpaRepository<WorkDatasheet, Long> {
    Optional<WorkDatasheet> findByInspectionId(Long inspectionId);
}
