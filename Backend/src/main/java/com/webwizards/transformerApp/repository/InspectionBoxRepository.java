package com.webwizards.transformerApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webwizards.transformerApp.model.InspectionBox;

public interface InspectionBoxRepository extends JpaRepository<InspectionBox, Long> {
}
