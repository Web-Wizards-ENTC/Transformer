package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {}
