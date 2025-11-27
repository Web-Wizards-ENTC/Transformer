package com.webwizards.transformerApp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class GeneralRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private LocalTime time;
    private String inspectorName;
    private String transformerStatus;
    private String recommendedAction;
    private String additionalRemarks;
    private Float voltageR;
    private Float voltageY;
    private Float voltageB;
    private Float currentR;
    private Float currentY;
    private Float currentB;
    private Float voltageR2;
    private Float voltageY2;
    private Float voltageB2;
    private Float currentR2;
    private Float currentY2;
    private Float currentB2;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getInspectorName() {
        return inspectorName;
    }

    public void setInspectorName(String inspectorName) {
        this.inspectorName = inspectorName;
    }

    public String getTransformerStatus() {
        return transformerStatus;
    }

    public void setTransformerStatus(String transformerStatus) {
        this.transformerStatus = transformerStatus;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getAdditionalRemarks() {
        return additionalRemarks;
    }

    public void setAdditionalRemarks(String additionalRemarks) {
        this.additionalRemarks = additionalRemarks;
    }

    public Float getVoltageR() {
        return voltageR;
    }

    public void setVoltageR(Float voltageR) {
        this.voltageR = voltageR;
    }

    public Float getVoltageY() {
        return voltageY;
    }

    public void setVoltageY(Float voltageY) {
        this.voltageY = voltageY;
    }

    public Float getVoltageB() {
        return voltageB;
    }

    public void setVoltageB(Float voltageB) {
        this.voltageB = voltageB;
    }

    public Float getCurrentR() {
        return currentR;
    }

    public void setCurrentR(Float currentR) {
        this.currentR = currentR;
    }

    public Float getCurrentY() {
        return currentY;
    }

    public void setCurrentY(Float currentY) {
        this.currentY = currentY;
    }

    public Float getCurrentB() {
        return currentB;
    }

    public void setCurrentB(Float currentB) {
        this.currentB = currentB;
    }

    public Float getVoltageR2() {
        return voltageR2;
    }

    public void setVoltageR2(Float voltageR2) {
        this.voltageR2 = voltageR2;
    }

    public Float getVoltageY2() {
        return voltageY2;
    }

    public void setVoltageY2(Float voltageY2) {
        this.voltageY2 = voltageY2;
    }

    public Float getVoltageB2() {
        return voltageB2;
    }

    public void setVoltageB2(Float voltageB2) {
        this.voltageB2 = voltageB2;
    }

    public Float getCurrentR2() {
        return currentR2;
    }

    public void setCurrentR2(Float currentR2) {
        this.currentR2 = currentR2;
    }

    public Float getCurrentY2() {
        return currentY2;
    }

    public void setCurrentY2(Float currentY2) {
        this.currentY2 = currentY2;
    }

    public Float getCurrentB2() {
        return currentB2;
    }

    public void setCurrentB2(Float currentB2) {
        this.currentB2 = currentB2;
    }
}