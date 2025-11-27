package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.GeneralRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GeneralRecordRepository extends JpaRepository<GeneralRecord, Long> {
}