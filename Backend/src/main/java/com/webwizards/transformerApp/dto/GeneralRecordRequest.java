package com.webwizards.transformerApp.dto;

public class GeneralRecordRequest {
    private Long inspectionId;
    private String date;
    private String time;
    private String inspectorName;
    private String transformerStatus;
    private String recommendedAction;
    private String additionalRemarks;

    private String voltageR, voltageY, voltageB;
    private String currentR, currentY, currentB;
    private String voltageR2, voltageY2, voltageB2;
    private String currentR2, currentY2, currentB2;

    public Long getInspectionId() { return inspectionId; }
    public void setInspectionId(Long inspectionId) { this.inspectionId = inspectionId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getInspectorName() { return inspectorName; }
    public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }

    public String getTransformerStatus() { return transformerStatus; }
    public void setTransformerStatus(String transformerStatus) { this.transformerStatus = transformerStatus; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getAdditionalRemarks() { return additionalRemarks; }
    public void setAdditionalRemarks(String additionalRemarks) { this.additionalRemarks = additionalRemarks; }

    public String getVoltageR() { return voltageR; }
    public void setVoltageR(String voltageR) { this.voltageR = voltageR; }

    public String getVoltageY() { return voltageY; }
    public void setVoltageY(String voltageY) { this.voltageY = voltageY; }

    public String getVoltageB() { return voltageB; }
    public void setVoltageB(String voltageB) { this.voltageB = voltageB; }

    public String getCurrentR() { return currentR; }
    public void setCurrentR(String currentR) { this.currentR = currentR; }

    public String getCurrentY() { return currentY; }
    public void setCurrentY(String currentY) { this.currentY = currentY; }

    public String getCurrentB() { return currentB; }
    public void setCurrentB(String currentB) { this.currentB = currentB; }

    public String getVoltageR2() { return voltageR2; }
    public void setVoltageR2(String voltageR2) { this.voltageR2 = voltageR2; }

    public String getVoltageY2() { return voltageY2; }
    public void setVoltageY2(String voltageY2) { this.voltageY2 = voltageY2; }

    public String getVoltageB2() { return voltageB2; }
    public void setVoltageB2(String voltageB2) { this.voltageB2 = voltageB2; }

    public String getCurrentR2() { return currentR2; }
    public void setCurrentR2(String currentR2) { this.currentR2 = currentR2; }

    public String getCurrentY2() { return currentY2; }
    public void setCurrentY2(String currentY2) { this.currentY2 = currentY2; }

    public String getCurrentB2() { return currentB2; }
    public void setCurrentB2(String currentB2) { this.currentB2 = currentB2; }
}
