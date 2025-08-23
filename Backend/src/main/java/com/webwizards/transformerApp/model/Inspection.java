package com.webwizards.transformerApp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inspectorName;
    private String notes;
    private LocalDateTime inspectionDate = LocalDateTime.now();

    // link to Transformer
    @ManyToOne
    @JoinColumn(name = "transformer_id", nullable = false)
    private Transformer transformer;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInspectorName() { return inspectorName; }
    public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDateTime inspectionDate) { this.inspectionDate = inspectionDate; }

    public Transformer getTransformer() { return transformer; }
    public void setTransformer(Transformer transformer) { this.transformer = transformer; }
}
