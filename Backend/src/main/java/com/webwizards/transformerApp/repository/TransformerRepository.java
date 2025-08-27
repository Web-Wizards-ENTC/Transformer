package com.webwizards.transformerApp.repository;

import com.webwizards.transformerApp.model.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransformerRepository extends JpaRepository<Transformer, String> {
    Optional<Transformer> findByTransformerNo(String transformerNo);
}
