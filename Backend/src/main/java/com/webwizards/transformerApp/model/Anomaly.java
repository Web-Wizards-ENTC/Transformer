package com.webwizards.transformerApp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "anomalies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anomaly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_number", nullable = false)
    private String inspectionNumber;

    @Column(name = "idx", nullable = false)
    private Integer idx;

    private String label;

    @Column(columnDefinition = "json")
    private String coords;

    private Float confidence;

    private String severity;

    private Float areaFrac;

    private Boolean isManual = false;

    private String createdBy;

    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    private String deletedBy;

    private LocalDateTime createdAt = LocalDateTime.now();
}
