package com.webwizards.transformerApp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "general_record_table")
public class GeneralRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long id;

    // if you want to link to maintenance_record_table.general_record_id, keep inspection,
    // but note: your SQL doesn’t currently have inspection_id in general_record_table.
    // If you want to keep the JPA relation as-is, you should also add inspection_id
    // (FK to inspection) in SQL instead of general_record_id.
    
    @Column(name = "date_of_inspection")
    private String date;

    @Column(name = "time_of_inspection")
    private String time;

    @Column(name = "inspected_by")
    private String inspectorName;

    @Column(name = "transformer_status")
    private String transformerStatus;

    @Column(name = "recommended_action")
    private String recommendedAction;

    @Column(name = "additional_remarks", length = 2000)
    private String additionalRemarks;

    @Column(name = "first_inspection_voltage_r")
    private String voltageR;
    @Column(name = "first_inspection_voltage_y")
    private String voltageY;
    @Column(name = "first_inspection_voltage_b")
    private String voltageB;
    @Column(name = "first_inspection_current_r")
    private String currentR;
    @Column(name = "first_inspection_current_y")
    private String currentY;
    @Column(name = "first_inspection_current_b")
    private String currentB;

    @Column(name = "second_inspection_voltage_r")
    private String voltageR2;
    @Column(name = "second_inspection_voltage_y")
    private String voltageY2;
    @Column(name = "second_inspection_voltage_b")
    private String voltageB2;
    @Column(name = "second_inspection_current_r")
    private String currentR2;
    @Column(name = "second_inspection_current_y")
    private String currentY2;
    @Column(name = "second_inspection_current_b")
    private String currentB2;

    // getters/setters unchanged
}