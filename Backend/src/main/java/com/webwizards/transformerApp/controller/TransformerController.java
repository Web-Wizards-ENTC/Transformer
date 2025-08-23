package com.webwizards.transformerApp.controller;   // ⚠️ use your actual package name

import com.webwizards.transformerApp.model.Transformer;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/transformers")
public class TransformerController {

    private List<Transformer> transformers = new ArrayList<>();

    // ➡ Add a transformer
    @PostMapping
    public Transformer addTransformer(@RequestBody Transformer transformer) {
        transformers.add(transformer);
        return transformer;
    }

    // ➡ Get all transformers
    @GetMapping
    public List<Transformer> getTransformers() {
        return transformers;
    }
}
