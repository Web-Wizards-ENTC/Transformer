package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
}