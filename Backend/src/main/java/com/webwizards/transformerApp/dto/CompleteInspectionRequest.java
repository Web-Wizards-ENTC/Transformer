package com.webwizards.transformerApp.dto;

import com.webwizards.transformerApp.model.GeneralRecord;
import com.webwizards.transformerApp.model.MaintenanceRecord;
import com.webwizards.transformerApp.model.WorkDataSheet;

public class CompleteInspectionRequest {
    private GeneralRecord generalRecord;
    private MaintenanceRecord maintenanceRecord;
    private WorkDataSheet workDataSheet;

    // Getters and setters
    public GeneralRecord getGeneralRecord() {
        return generalRecord;
    }

    public void setGeneralRecord(GeneralRecord generalRecord) {
        this.generalRecord = generalRecord;
    }

    public MaintenanceRecord getMaintenanceRecord() {
        return maintenanceRecord;
    }

    public void setMaintenanceRecord(MaintenanceRecord maintenanceRecord) {
        this.maintenanceRecord = maintenanceRecord;
    }

    public WorkDataSheet getWorkDataSheet() {
        return workDataSheet;
    }

    public void setWorkDataSheet(WorkDataSheet workDataSheet) {
        this.workDataSheet = workDataSheet;
    }
}
