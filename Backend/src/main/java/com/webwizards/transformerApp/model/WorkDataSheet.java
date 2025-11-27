package com.webwizards.transformerApp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class WorkDataSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gangLeader;
    private LocalDate workDate;
    private LocalTime jobStartedTime;
    private String serialNo;
    private String kva;
    private String make;
    private String tapPosition;
    private String txCtRation;
    private String manufactureYear;
    private Float earthResistance;
    private Float neutral;
    private String surgeOrBody;
    private Boolean fdsF1;
    private Float fdsF1A;
    private Boolean fdsF2;
    private Float fdsF2A;
    private Boolean fdsF3;
    private Float fdsF3A;
    private Boolean fdsF4;
    private Float fdsF4A;
    private Boolean fdsF5;
    private Float fdsF5A;
    private LocalTime jobCompletedTime;
    private String workNotes;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGangLeader() {
        return gangLeader;
    }

    public void setGangLeader(String gangLeader) {
        this.gangLeader = gangLeader;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public LocalTime getJobStartedTime() {
        return jobStartedTime;
    }

    public void setJobStartedTime(LocalTime jobStartedTime) {
        this.jobStartedTime = jobStartedTime;
    }

    public String getSerialNo() {
        return serialNo;
    }

    public void setSerialNo(String serialNo) {
        this.serialNo = serialNo;
    }

    public String getKva() {
        return kva;
    }

    public void setKva(String kva) {
        this.kva = kva;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getTapPosition() {
        return tapPosition;
    }

    public void setTapPosition(String tapPosition) {
        this.tapPosition = tapPosition;
    }

    public String getTxCtRation() {
        return txCtRation;
    }

    public void setTxCtRation(String txCtRation) {
        this.txCtRation = txCtRation;
    }

    public String getManufactureYear() {
        return manufactureYear;
    }

    public void setManufactureYear(String manufactureYear) {
        this.manufactureYear = manufactureYear;
    }

    public Float getEarthResistance() {
        return earthResistance;
    }

    public void setEarthResistance(Float earthResistance) {
        this.earthResistance = earthResistance;
    }

    public Float getNeutral() {
        return neutral;
    }

    public void setNeutral(Float neutral) {
        this.neutral = neutral;
    }

    public String getSurgeOrBody() {
        return surgeOrBody;
    }

    public void setSurgeOrBody(String surgeOrBody) {
        this.surgeOrBody = surgeOrBody;
    }

    public Boolean getFdsF1() {
        return fdsF1;
    }

    public void setFdsF1(Boolean fdsF1) {
        this.fdsF1 = fdsF1;
    }

    public Float getFdsF1A() {
        return fdsF1A;
    }

    public void setFdsF1A(Float fdsF1A) {
        this.fdsF1A = fdsF1A;
    }

    public Boolean getFdsF2() {
        return fdsF2;
    }

    public void setFdsF2(Boolean fdsF2) {
        this.fdsF2 = fdsF2;
    }

    public Float getFdsF2A() {
        return fdsF2A;
    }

    public void setFdsF2A(Float fdsF2A) {
        this.fdsF2A = fdsF2A;
    }

    public Boolean getFdsF3() {
        return fdsF3;
    }

    public void setFdsF3(Boolean fdsF3) {
        this.fdsF3 = fdsF3;
    }

    public Float getFdsF3A() {
        return fdsF3A;
    }

    public void setFdsF3A(Float fdsF3A) {
        this.fdsF3A = fdsF3A;
    }

    public Boolean getFdsF4() {
        return fdsF4;
    }

    public void setFdsF4(Boolean fdsF4) {
        this.fdsF4 = fdsF4;
    }

    public Float getFdsF4A() {
        return fdsF4A;
    }

    public void setFdsF4A(Float fdsF4A) {
        this.fdsF4A = fdsF4A;
    }

    public Boolean getFdsF5() {
        return fdsF5;
    }

    public void setFdsF5(Boolean fdsF5) {
        this.fdsF5 = fdsF5;
    }

    public Float getFdsF5A() {
        return fdsF5A;
    }

    public void setFdsF5A(Float fdsF5A) {
        this.fdsF5A = fdsF5A;
    }

    public LocalTime getJobCompletedTime() {
        return jobCompletedTime;
    }

    public void setJobCompletedTime(LocalTime jobCompletedTime) {
        this.jobCompletedTime = jobCompletedTime;
    }

    public String getWorkNotes() {
        return workNotes;
    }

    public void setWorkNotes(String workNotes) {
        this.workNotes = workNotes;
    }
}