package com.webwizards.transformerApp.dto;

import com.webwizards.transformerApp.model.MaintenanceRecord;
import com.webwizards.transformerApp.model.WorkDataSheet;

public class CompleteInspectionRequest {
    private WorkDataSheet workDataSheet;
    private MaintenanceRecord maintenanceRecord;

    // Getters and setters
    public WorkDataSheet getWorkDataSheet() {
        return workDataSheet;
    }

    public void setWorkDataSheet(WorkDataSheet workDataSheet) {
        this.workDataSheet = workDataSheet;
    }

    public MaintenanceRecord getMaintenanceRecord() {
        return maintenanceRecord;
    }

    public void setMaintenanceRecord(MaintenanceRecord maintenanceRecord) {
        this.maintenanceRecord = maintenanceRecord;
    }
}
