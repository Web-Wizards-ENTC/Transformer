package com.webwizards.transformerApp.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "bounding_boxes")
public class InspectionBox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inspectionId; // repeated per box

    @Column(name = "box_index_id")
    private String boxIndexId;

    private Integer x;
    private Integer y;
    private Integer w;
    private Integer h;

    @Column(name = "area_frac")
    private Double areaFrac;

    private Double aspect;

    @Column(name = "overlap_center_frac")
    private Double overlapCenterFrac;

    private String label;

    private String boxFault;

    public String getBoxIndexId() { return boxIndexId; }
    public void setBoxIndexId(String boxIndexId) { this.boxIndexId = boxIndexId; }

    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInspectionId() { return inspectionId; }
    public void setInspectionId(String inspectionId) { this.inspectionId = inspectionId; }

    public Integer getX() { return x; }
    public void setX(Integer x) { this.x = x; }

    public Integer getY() { return y; }
    public void setY(Integer y) { this.y = y; }

    public Integer getW() { return w; }
    public void setW(Integer w) { this.w = w; }

    public Integer getH() { return h; }
    public void setH(Integer h) { this.h = h; }

    public Double getAreaFrac() { return areaFrac; }
    public void setAreaFrac(Double areaFrac) { this.areaFrac = areaFrac; }

    public Double getAspect() { return aspect; }
    public void setAspect(Double aspect) { this.aspect = aspect; }

    public Double getOverlapCenterFrac() { return overlapCenterFrac; }
    public void setOverlapCenterFrac(Double overlapCenterFrac) { this.overlapCenterFrac = overlapCenterFrac; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getBoxFault() { return boxFault; }
    public void setBoxFault(String boxFault) { this.boxFault = boxFault; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    @PrePersist
    public void prePersist() { if (createdAt == null) createdAt = Instant.now(); }
}
