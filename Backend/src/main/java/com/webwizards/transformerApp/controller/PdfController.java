package com.webwizards.transformerApp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webwizards.transformerApp.dto.CompleteInspectionRequest;
import com.webwizards.transformerApp.model.WorkDataSheet;
import com.webwizards.transformerApp.service.PdfGenerationService;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "*")
public class PdfController {

    @Autowired
    private PdfGenerationService pdfGenerationService;

    /**
     * Generate PDF with mock data for testing
     */
    @GetMapping("/generate/mock")
    public ResponseEntity<byte[]> generateMockPdf() {
        try {
            byte[] pdfBytes = pdfGenerationService.generateMockInspectionPdf();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "transformer_complete_inspection_mock.pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Generate complete PDF with WorkDataSheet and MaintenanceRecord
     */
    @PostMapping("/generate/complete")
    public ResponseEntity<byte[]> generateCompletePdf(@RequestBody CompleteInspectionRequest request) {
        try {
            byte[] pdfBytes = pdfGenerationService.generateCompleteInspectionPdf(
                    request.getWorkDataSheet(), 
                    request.getMaintenanceRecord()
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "transformer_complete_" + request.getWorkDataSheet().getSerialNo() + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Generate PDF from WorkDataSheet data
     */
    @PostMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(@RequestBody WorkDataSheet workData) {
        try {
            byte[] pdfBytes = pdfGenerationService.generateInspectionPdf(workData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "transformer_inspection_" + workData.getSerialNo() + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Generate PDF by WorkDataSheet ID
     */
    @GetMapping("/generate/{id}")
    public ResponseEntity<byte[]> generatePdfById(@PathVariable Long id) {
        // TODO: Implement fetching WorkDataSheet from database by ID
        // For now, returns mock data
        try {
            byte[] pdfBytes = pdfGenerationService.generateMockInspectionPdf();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "transformer_inspection_" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
