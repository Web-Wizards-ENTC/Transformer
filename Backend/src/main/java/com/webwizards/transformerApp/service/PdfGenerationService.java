package com.webwizards.transformerApp.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.webwizards.transformerApp.model.MaintenanceRecord;
import com.webwizards.transformerApp.model.WorkDataSheet;

@Service
public class PdfGenerationService {

    public byte[] generateCompleteInspectionPdf(WorkDataSheet workData, MaintenanceRecord maintenance) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Main Header
            Paragraph mainHeader = new Paragraph("COMPLETE TRANSFORMER INSPECTION REPORT")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(30);
            document.add(mainHeader);

            // ========== SECTION 1: WORK DATA SHEET ==========
            addWorkDataSheetSection(document, workData);
            
            // Page break before maintenance section
            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            
            // ========== SECTION 2: MAINTENANCE RECORD ==========
            addMaintenanceRecordSection(document, maintenance);

            // Footer
            Paragraph footer = new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(30);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    private void addWorkDataSheetSection(Document document, WorkDataSheet workData) {
        // Section Header
        Paragraph sectionHeader = new Paragraph("WORK DATA SHEET")
                .setFontSize(16)
                .setBold()
                .setBackgroundColor(new DeviceRgb(41, 128, 185))
                .setFontColor(ColorConstants.WHITE)
                .setPadding(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15);
        document.add(sectionHeader);

        // Date and Time Section
        Table dateTimeTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        dateTimeTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(dateTimeTable, "Work Date:", true);
        addTableCell(dateTimeTable, formatDate(workData.getWorkDate()), false);
        
        addTableCell(dateTimeTable, "Job Started:", true);
        addTableCell(dateTimeTable, formatTime(workData.getJobStartedTime()), false);
        
        addTableCell(dateTimeTable, "Job Completed:", true);
        addTableCell(dateTimeTable, formatTime(workData.getJobCompletedTime()), false);
        
        document.add(dateTimeTable);
        document.add(new Paragraph("\n"));

        // Transformer Details
        Paragraph detailsHeader = new Paragraph("Transformer Details")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(detailsHeader);

        Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        detailsTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(detailsTable, "Gang Leader:", true);
        addTableCell(detailsTable, workData.getGangLeader(), false);
        
        addTableCell(detailsTable, "Serial No:", true);
        addTableCell(detailsTable, workData.getSerialNo(), false);
        
        addTableCell(detailsTable, "KVA:", true);
        addTableCell(detailsTable, workData.getKva(), false);
        
        addTableCell(detailsTable, "Make:", true);
        addTableCell(detailsTable, workData.getMake(), false);
        
        addTableCell(detailsTable, "Tap Position:", true);
        addTableCell(detailsTable, workData.getTapPosition(), false);
        
        addTableCell(detailsTable, "TX CT Ratio:", true);
        addTableCell(detailsTable, workData.getTxCtRation(), false);
        
        addTableCell(detailsTable, "Manufacture Year:", true);
        addTableCell(detailsTable, workData.getManufactureYear(), false);
        
        document.add(detailsTable);
        document.add(new Paragraph("\n"));

        // Measurements
        Paragraph measurementsHeader = new Paragraph("Electrical Measurements")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(measurementsHeader);

        Table measurementsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        measurementsTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(measurementsTable, "Earth Resistance:", true);
        addTableCell(measurementsTable, formatFloat(workData.getEarthResistance()) + " Ω", false);
        
        addTableCell(measurementsTable, "Neutral:", true);
        addTableCell(measurementsTable, formatFloat(workData.getNeutral()) + " Ω", false);
        
        addTableCell(measurementsTable, "Surge or Body:", true);
        addTableCell(measurementsTable, workData.getSurgeOrBody(), false);
        
        document.add(measurementsTable);
        document.add(new Paragraph("\n"));

        // FDS Test Results
        Paragraph fdsHeader = new Paragraph("FDS Test Results")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(fdsHeader);

        Table fdsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}));
        fdsTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(fdsTable, "Test", true);
        addTableCell(fdsTable, "Status", true);
        addTableCell(fdsTable, "Value", true);
        
        addTableCell(fdsTable, "FDS F1", false);
        addTableCell(fdsTable, formatBoolean(workData.getFdsF1()), false);
        addTableCell(fdsTable, formatFloat(workData.getFdsF1A()), false);
        
        addTableCell(fdsTable, "FDS F2", false);
        addTableCell(fdsTable, formatBoolean(workData.getFdsF2()), false);
        addTableCell(fdsTable, formatFloat(workData.getFdsF2A()), false);
        
        addTableCell(fdsTable, "FDS F3", false);
        addTableCell(fdsTable, formatBoolean(workData.getFdsF3()), false);
        addTableCell(fdsTable, formatFloat(workData.getFdsF3A()), false);
        
        addTableCell(fdsTable, "FDS F4", false);
        addTableCell(fdsTable, formatBoolean(workData.getFdsF4()), false);
        addTableCell(fdsTable, formatFloat(workData.getFdsF4A()), false);
        
        addTableCell(fdsTable, "FDS F5", false);
        addTableCell(fdsTable, formatBoolean(workData.getFdsF5()), false);
        addTableCell(fdsTable, formatFloat(workData.getFdsF5A()), false);
        
        document.add(fdsTable);
        document.add(new Paragraph("\n"));

        // Work Notes
        if (workData.getWorkNotes() != null && !workData.getWorkNotes().isEmpty()) {
            Paragraph notesHeader = new Paragraph("Work Notes")
                    .setFontSize(14)
                    .setBold()
                    .setMarginTop(10)
                    .setMarginBottom(10);
            document.add(notesHeader);

            Paragraph notes = new Paragraph(workData.getWorkNotes())
                    .setBackgroundColor(new DeviceRgb(245, 245, 245))
                    .setPadding(10);
            document.add(notes);
        }
    }

    private void addMaintenanceRecordSection(Document document, MaintenanceRecord maintenance) {
        // Section Header
        Paragraph sectionHeader = new Paragraph("MAINTENANCE RECORD")
                .setFontSize(16)
                .setBold()
                .setBackgroundColor(new DeviceRgb(231, 76, 60))
                .setFontColor(ColorConstants.WHITE)
                .setPadding(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15);
        document.add(sectionHeader);

        // Time Information
        Paragraph timeHeader = new Paragraph("Time Information")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(timeHeader);

        Table timeTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        timeTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(timeTable, "Start Time:", true);
        addTableCell(timeTable, formatTime(maintenance.getStartTime()), false);
        
        addTableCell(timeTable, "Completion Time:", true);
        addTableCell(timeTable, formatTime(maintenance.getCompletionTime()), false);
        
        document.add(timeTable);
        document.add(new Paragraph("\n"));

        // Personnel Information
        Paragraph personnelHeader = new Paragraph("Personnel Information")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(personnelHeader);

        Table personnelTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        personnelTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(personnelTable, "Supervised By:", true);
        addTableCell(personnelTable, maintenance.getSupervisedBy(), false);
        
        addTableCell(personnelTable, "Tech I:", true);
        addTableCell(personnelTable, maintenance.getTechI(), false);
        
        addTableCell(personnelTable, "Tech II:", true);
        addTableCell(personnelTable, maintenance.getTechII(), false);
        
        addTableCell(personnelTable, "Tech III:", true);
        addTableCell(personnelTable, maintenance.getTechIII(), false);
        
        addTableCell(personnelTable, "Helpers:", true);
        addTableCell(personnelTable, maintenance.getHelpers(), false);
        
        document.add(personnelTable);
        document.add(new Paragraph("\n"));

        // Inspection & Rectification
        Paragraph inspectionHeader = new Paragraph("Inspection & Rectification")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(inspectionHeader);

        Table inspectionTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        inspectionTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(inspectionTable, "Inspected By:", true);
        addTableCell(inspectionTable, maintenance.getInspectedBy(), false);
        
        addTableCell(inspectionTable, "Inspected Date:", true);
        addTableCell(inspectionTable, formatDate(maintenance.getInspectedDate()), false);
        
        addTableCell(inspectionTable, "Rectified By:", true);
        addTableCell(inspectionTable, maintenance.getRectifiedBy(), false);
        
        addTableCell(inspectionTable, "Rectified Date:", true);
        addTableCell(inspectionTable, formatDate(maintenance.getRectifiedDate()), false);
        
        addTableCell(inspectionTable, "Re-Inspected By:", true);
        addTableCell(inspectionTable, maintenance.getReInspectedBy(), false);
        
        addTableCell(inspectionTable, "Re-Inspected Date:", true);
        addTableCell(inspectionTable, formatDate(maintenance.getReInspectedDate()), false);
        
        document.add(inspectionTable);
        document.add(new Paragraph("\n"));

        // CSS Information
        Paragraph cssHeader = new Paragraph("CSS Verification")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10)
                .setMarginBottom(10);
        document.add(cssHeader);

        Table cssTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        cssTable.setWidth(UnitValue.createPercentValue(100));
        
        addTableCell(cssTable, "CSS 1:", true);
        addTableCell(cssTable, maintenance.getCss1(), false);
        
        addTableCell(cssTable, "CSS 1 Date:", true);
        addTableCell(cssTable, formatDate(maintenance.getCss1Date()), false);
        
        addTableCell(cssTable, "All Spots Correct:", true);
        addTableCell(cssTable, formatBoolean(maintenance.getAllSpotsCorrect()), false);
        
        addTableCell(cssTable, "CSS 2:", true);
        addTableCell(cssTable, maintenance.getCss2(), false);
        
        addTableCell(cssTable, "CSS 2 Date:", true);
        addTableCell(cssTable, formatDate(maintenance.getCss2Date()), false);
        
        document.add(cssTable);
    }

    public byte[] generateInspectionPdf(WorkDataSheet workData) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Header
            Paragraph header = new Paragraph("TRANSFORMER INSPECTION REPORT")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(header);

            // Date and Time Section
            Table dateTimeTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
            dateTimeTable.setWidth(UnitValue.createPercentValue(100));
            
            addTableCell(dateTimeTable, "Work Date:", true);
            addTableCell(dateTimeTable, formatDate(workData.getWorkDate()), false);
            
            addTableCell(dateTimeTable, "Job Started:", true);
            addTableCell(dateTimeTable, formatTime(workData.getJobStartedTime()), false);
            
            addTableCell(dateTimeTable, "Job Completed:", true);
            addTableCell(dateTimeTable, formatTime(workData.getJobCompletedTime()), false);
            
            document.add(dateTimeTable);
            document.add(new Paragraph("\n"));

            // Transformer Details Section
            Paragraph detailsHeader = new Paragraph("Transformer Details")
                    .setFontSize(14)
                    .setBold()
                    .setMarginTop(10)
                    .setMarginBottom(10);
            document.add(detailsHeader);

            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
            detailsTable.setWidth(UnitValue.createPercentValue(100));
            
            addTableCell(detailsTable, "Gang Leader:", true);
            addTableCell(detailsTable, workData.getGangLeader(), false);
            
            addTableCell(detailsTable, "Serial No:", true);
            addTableCell(detailsTable, workData.getSerialNo(), false);
            
            addTableCell(detailsTable, "KVA:", true);
            addTableCell(detailsTable, workData.getKva(), false);
            
            addTableCell(detailsTable, "Make:", true);
            addTableCell(detailsTable, workData.getMake(), false);
            
            addTableCell(detailsTable, "Tap Position:", true);
            addTableCell(detailsTable, workData.getTapPosition(), false);
            
            addTableCell(detailsTable, "TX CT Ratio:", true);
            addTableCell(detailsTable, workData.getTxCtRation(), false);
            
            addTableCell(detailsTable, "Manufacture Year:", true);
            addTableCell(detailsTable, workData.getManufactureYear(), false);
            
            document.add(detailsTable);
            document.add(new Paragraph("\n"));

            // Measurements Section
            Paragraph measurementsHeader = new Paragraph("Electrical Measurements")
                    .setFontSize(14)
                    .setBold()
                    .setMarginTop(10)
                    .setMarginBottom(10);
            document.add(measurementsHeader);

            Table measurementsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
            measurementsTable.setWidth(UnitValue.createPercentValue(100));
            
            addTableCell(measurementsTable, "Earth Resistance:", true);
            addTableCell(measurementsTable, formatFloat(workData.getEarthResistance()) + " Ω", false);
            
            addTableCell(measurementsTable, "Neutral:", true);
            addTableCell(measurementsTable, formatFloat(workData.getNeutral()) + " Ω", false);
            
            addTableCell(measurementsTable, "Surge or Body:", true);
            addTableCell(measurementsTable, workData.getSurgeOrBody(), false);
            
            document.add(measurementsTable);
            document.add(new Paragraph("\n"));

            // FDS Test Results
            Paragraph fdsHeader = new Paragraph("FDS Test Results")
                    .setFontSize(14)
                    .setBold()
                    .setMarginTop(10)
                    .setMarginBottom(10);
            document.add(fdsHeader);

            Table fdsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}));
            fdsTable.setWidth(UnitValue.createPercentValue(100));
            
            // Header row
            addTableCell(fdsTable, "Test", true);
            addTableCell(fdsTable, "Status", true);
            addTableCell(fdsTable, "Value", true);
            
            // FDS F1
            addTableCell(fdsTable, "FDS F1", false);
            addTableCell(fdsTable, formatBoolean(workData.getFdsF1()), false);
            addTableCell(fdsTable, formatFloat(workData.getFdsF1A()), false);
            
            // FDS F2
            addTableCell(fdsTable, "FDS F2", false);
            addTableCell(fdsTable, formatBoolean(workData.getFdsF2()), false);
            addTableCell(fdsTable, formatFloat(workData.getFdsF2A()), false);
            
            // FDS F3
            addTableCell(fdsTable, "FDS F3", false);
            addTableCell(fdsTable, formatBoolean(workData.getFdsF3()), false);
            addTableCell(fdsTable, formatFloat(workData.getFdsF3A()), false);
            
            // FDS F4
            addTableCell(fdsTable, "FDS F4", false);
            addTableCell(fdsTable, formatBoolean(workData.getFdsF4()), false);
            addTableCell(fdsTable, formatFloat(workData.getFdsF4A()), false);
            
            // FDS F5
            addTableCell(fdsTable, "FDS F5", false);
            addTableCell(fdsTable, formatBoolean(workData.getFdsF5()), false);
            addTableCell(fdsTable, formatFloat(workData.getFdsF5A()), false);
            
            document.add(fdsTable);
            document.add(new Paragraph("\n"));

            // Work Notes Section
            if (workData.getWorkNotes() != null && !workData.getWorkNotes().isEmpty()) {
                Paragraph notesHeader = new Paragraph("Work Notes")
                        .setFontSize(14)
                        .setBold()
                        .setMarginTop(10)
                        .setMarginBottom(10);
                document.add(notesHeader);

                Paragraph notes = new Paragraph(workData.getWorkNotes())
                        .setBackgroundColor(new DeviceRgb(245, 245, 245))
                        .setPadding(10);
                document.add(notes);
            }

            // Footer
            Paragraph footer = new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20);
            document.add(footer);

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    public byte[] generateMockInspectionPdf() {
        // Create mock WorkDataSheet
        WorkDataSheet mockData = new WorkDataSheet();
        mockData.setGangLeader("John Smith");
        mockData.setWorkDate(LocalDate.now());
        mockData.setJobStartedTime(LocalTime.of(9, 0));
        mockData.setJobCompletedTime(LocalTime.of(15, 30));
        mockData.setSerialNo("TXF-2024-001");
        mockData.setKva("500");
        mockData.setMake("ABB");
        mockData.setTapPosition("5");
        mockData.setTxCtRation("100/5");
        mockData.setManufactureYear("2020");
        mockData.setEarthResistance(2.5f);
        mockData.setNeutral(1.8f);
        mockData.setSurgeOrBody("Normal");
        mockData.setFdsF1(true);
        mockData.setFdsF1A(95.5f);
        mockData.setFdsF2(true);
        mockData.setFdsF2A(94.8f);
        mockData.setFdsF3(false);
        mockData.setFdsF3A(88.2f);
        mockData.setFdsF4(true);
        mockData.setFdsF4A(96.1f);
        mockData.setFdsF5(true);
        mockData.setFdsF5A(97.3f);
        mockData.setWorkNotes("All tests completed successfully. Transformer is in good working condition. Minor oil leak detected and fixed during inspection. Recommended for next inspection after 6 months.");

        // Create mock MaintenanceRecord
        MaintenanceRecord mockMaintenance = new MaintenanceRecord();
        mockMaintenance.setStartTime(LocalTime.of(9, 0));
        mockMaintenance.setCompletionTime(LocalTime.of(15, 30));
        mockMaintenance.setSupervisedBy("Michael Johnson");
        mockMaintenance.setTechI("David Brown");
        mockMaintenance.setTechII("Robert Wilson");
        mockMaintenance.setTechIII("James Anderson");
        mockMaintenance.setHelpers("Thomas Lee, Christopher Martin");
        mockMaintenance.setInspectedBy("Sarah Davis");
        mockMaintenance.setInspectedDate(LocalDate.now().minusDays(1));
        mockMaintenance.setRectifiedBy("John Smith");
        mockMaintenance.setRectifiedDate(LocalDate.now());
        mockMaintenance.setReInspectedBy("Sarah Davis");
        mockMaintenance.setReInspectedDate(LocalDate.now());
        mockMaintenance.setCss1("CSS Officer 1");
        mockMaintenance.setCss1Date(LocalDate.now());
        mockMaintenance.setAllSpotsCorrect(true);
        mockMaintenance.setCss2("CSS Officer 2");
        mockMaintenance.setCss2Date(LocalDate.now());

        return generateCompleteInspectionPdf(mockData, mockMaintenance);
    }

    private void addTableCell(Table table, String content, boolean isHeader) {
        Cell cell = new Cell().add(new Paragraph(content));
        
        if (isHeader) {
            cell.setBackgroundColor(new DeviceRgb(52, 152, 219))
                .setFontColor(ColorConstants.WHITE)
                .setBold();
        } else {
            cell.setBackgroundColor(new DeviceRgb(236, 240, 241));
        }
        
        cell.setPadding(8);
        table.addCell(cell);
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "N/A";
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String formatTime(LocalTime time) {
        if (time == null) return "N/A";
        return time.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String formatFloat(Float value) {
        if (value == null) return "N/A";
        return String.format("%.2f", value);
    }

    private String formatBoolean(Boolean value) {
        if (value == null) return "N/A";
        return value ? "PASS" : "FAIL";
    }
}
