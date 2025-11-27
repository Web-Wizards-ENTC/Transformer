package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.WorkDataSheet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkDataSheetRepository extends JpaRepository<WorkDataSheet, Long> {
}