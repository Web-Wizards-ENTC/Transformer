package com.webwizards.transformerApp.controller;

import com.webwizards.transformerApp.model.Transformer;
import com.webwizards.transformerApp.repository.TransformerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transformers")
public class TransformerController {

    private final TransformerRepository repository;

    public TransformerController(TransformerRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Transformer addTransformer(@RequestBody Transformer transformer) {
        return repository.save(transformer);
    }

    @GetMapping
    public List<Transformer> getTransformers() {
        return repository.findAll();
    }
}
