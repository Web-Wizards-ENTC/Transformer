package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.GeneralRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GeneralRecordRepository extends JpaRepository<GeneralRecord, Long> {
    Optional<GeneralRecord> findByInspectionId(Long inspectionId);
}
