package com.webwizards.transformerApp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalTime startTime;
    private LocalTime completionTime;
    private String supervisedBy;
    private String techI;
    private String techII;
    private String techIII;
    private String helpers;
    private String inspectedBy;
    private LocalDate inspectedDate;
    private String rectifiedBy;
    private LocalDate rectifiedDate;
    private String reInspectedBy;
    private LocalDate reInspectedDate;
    private String css1;
    private LocalDate css1Date;
    private Boolean allSpotsCorrect;
    private String css2;
    private LocalDate css2Date;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(LocalTime completionTime) {
        this.completionTime = completionTime;
    }

    public String getSupervisedBy() {
        return supervisedBy;
    }

    public void setSupervisedBy(String supervisedBy) {
        this.supervisedBy = supervisedBy;
    }

    public String getTechI() {
        return techI;
    }

    public void setTechI(String techI) {
        this.techI = techI;
    }

    public String getTechII() {
        return techII;
    }

    public void setTechII(String techII) {
        this.techII = techII;
    }

    public String getTechIII() {
        return techIII;
    }

    public void setTechIII(String techIII) {
        this.techIII = techIII;
    }

    public String getHelpers() {
        return helpers;
    }

    public void setHelpers(String helpers) {
        this.helpers = helpers;
    }

    public String getInspectedBy() {
        return inspectedBy;
    }

    public void setInspectedBy(String inspectedBy) {
        this.inspectedBy = inspectedBy;
    }

    public LocalDate getInspectedDate() {
        return inspectedDate;
    }

    public void setInspectedDate(LocalDate inspectedDate) {
        this.inspectedDate = inspectedDate;
    }

    public String getRectifiedBy() {
        return rectifiedBy;
    }

    public void setRectifiedBy(String rectifiedBy) {
        this.rectifiedBy = rectifiedBy;
    }

    public LocalDate getRectifiedDate() {
        return rectifiedDate;
    }

    public void setRectifiedDate(LocalDate rectifiedDate) {
        this.rectifiedDate = rectifiedDate;
    }

    public String getReInspectedBy() {
        return reInspectedBy;
    }

    public void setReInspectedBy(String reInspectedBy) {
        this.reInspectedBy = reInspectedBy;
    }

    public LocalDate getReInspectedDate() {
        return reInspectedDate;
    }

    public void setReInspectedDate(LocalDate reInspectedDate) {
        this.reInspectedDate = reInspectedDate;
    }

    public String getCss1() {
        return css1;
    }

    public void setCss1(String css1) {
        this.css1 = css1;
    }

    public LocalDate getCss1Date() {
        return css1Date;
    }

    public void setCss1Date(LocalDate css1Date) {
        this.css1Date = css1Date;
    }

    public Boolean getAllSpotsCorrect() {
        return allSpotsCorrect;
    }

    public void setAllSpotsCorrect(Boolean allSpotsCorrect) {
        this.allSpotsCorrect = allSpotsCorrect;
    }

    public String getCss2() {
        return css2;
    }

    public void setCss2(String css2) {
        this.css2 = css2;
    }

    public LocalDate getCss2Date() {
        return css2Date;
    }

    public void setCss2Date(LocalDate css2Date) {
        this.css2Date = css2Date;
    }
}