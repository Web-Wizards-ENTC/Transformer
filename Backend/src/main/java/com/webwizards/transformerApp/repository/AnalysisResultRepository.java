package com.webwizards.transformerApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webwizards.transformerApp.model.AnalysisResult;

public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    // additional query methods can be added here
}
