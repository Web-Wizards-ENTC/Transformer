package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransformerRepository extends JpaRepository<Transformer, Long> {
}