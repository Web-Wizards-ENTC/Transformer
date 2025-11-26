package com.webwizards.transformerApp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "work_data_sheet_table")
public class WorkDatasheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_record_id")
    private Long id;

    @Column(name = "gang_leader")
    private String gangLeader;

    @Column(name = "work_date")
    private String workDate;

    @Column(name = "job_started_time")
    private String jobStartedTime;

    @Column(name = "serial_no")
    private String serialNo;

    @Column(name = "kva_rating")
    private Integer kva; // or String if you want

    @Column(name = "make")
    private String make;

    @Column(name = "tap_position")
    private Integer tapPosition;

    @Column(name = "tx_ct_ration")
    private String txCtRation;

    @Column(name = "manufacture_year")
    private Integer manufactureYear;

    @Column(name = "earth_resistance_ohm")
    private String earthResistance;

    @Column(name = "neutral_resistance_ohm")
    private String neutral;

    @Column(name = "protection_surge")
    private Boolean protectionSurge;

    @Column(name = "protection_body")
    private Boolean protectionBody;

    @Column(name = "f1_fuse_rating")
    private String f1FuseRating;
    @Column(name = "f2_fuse_rating")
    private String f2FuseRating;
    @Column(name = "f3_fuse_rating")
    private String f3FuseRating;
    @Column(name = "f4_fuse_rating")
    private String f4FuseRating;
    @Column(name = "f5_fuse_rating")
    private String f5FuseRating;

    @Column(name = "job_notes", length = 2000)
    private String workNotes;

    @Column(name = "material_16mm2_copper_used")
    private Boolean material_B112;
    @Column(name = "material_70mm2_abc_used")
    private Boolean material_B244;
    @Column(name = "material_14mm2_aluminum_used")
    private Boolean material_B712;
    @Column(name = "material_50mm2_earth_used")
    private Boolean material_B815;
    @Column(name = "material_60mm2_aac_used")
    private Boolean material_C113;
    @Column(name = "material_16mm2_copper_lug_used")
    private Boolean material_G332;
    @Column(name = "material_50mm2_copper_lug_used")
    private Boolean material_G354;
    @Column(name = "material_2_5mm2_ct_lug_used")
    private Boolean material_G360;
    @Column(name = "material_35mm2_bimetallic_lug_used")
    private Boolean material_G373A;
    @Column(name = "material_50mm2_bimetallic_lug_used")
    private Boolean material_G374;

    // plus jobCompletedTime -> add @Column(name = "job_completed_time") if you add it to SQL
}