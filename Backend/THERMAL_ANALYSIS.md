# Thermal Analysis Integration Documentation

This document explains how to use the thermal analysis integration with the `analyze.py` script for transformer thermal image comparison.

## Overview

The thermal analysis system compares baseline and candidate thermal images to detect potential faults in electrical transformers. The Python script `analyze.py` performs rule-based thermal comparison and returns detailed analysis results including fault classification, bounding boxes, and statistical measures.

## API Endpoints

### 1. General Thermal Analysis (`POST /api/thermal/analyze`)

**Request Body (JSON):**
```json
{
    "baselineImagePath": "/path/to/baseline.png",
    "candidateImagePath": "/path/to/candidate.png",
    "parameters": {
        "threshold": 0.8
    }
}
```

**Response:**
```json
{
    "success": true,
    "prediction": "loose joint",
    "confidence": 0.85,
    "prob": 0.85,
    "histDistance": 0.342,
    "dv95": 0.167,
    "warmFraction": 0.023,
    "imageWidth": 640,
    "imageHeight": 480,
    "faultType": "loose joint",
    "boxes": [
        [120, 85, 45, 32],
        [200, 150, 38, 28]
    ],
    "boxInfo": [
        {
            "x": 120,
            "y": 85,
            "w": 45,
            "h": 32,
            "areaFrac": 0.195,
            "aspect": 1.4,
            "overlapCenterFrac": 0.6,
            "label": "Loose joint",
            "boxFault": "loose joint"
        }
    ],
    "annotated": "",
    "processingTimeMs": 1250
}
```

### 2. Analyze Using Stored Images (`POST /api/thermal/analyze-images/{baselineId}/{candidateId}`)

**URL Parameters:**
- `baselineId`: ID of the baseline image stored in the database
- `candidateId`: ID of the candidate image stored in the database

**Example:**
```bash
POST /api/thermal/analyze-images/123/456
```

### 3. Analyze with File Uploads (`POST /api/thermal/analyze-upload`)

**Form Data:**
- `baselineFile`: Baseline thermal image file
- `candidateFile`: Candidate thermal image file

**Example:**
```bash
curl -X POST \
  -F "baselineFile=@baseline.png" \
  -F "candidateFile=@candidate.png" \
  http://localhost:8080/api/thermal/analyze-upload
```

### 4. Analyze with Uploaded Baseline (`POST /api/thermal/analyze-with-baseline/{candidateId}`)

**URL Parameters:**
- `candidateId`: ID of the candidate image stored in the database

**Form Data:**
- `baselineFile`: Baseline thermal image file to upload

## Fault Types

The thermal analysis can detect the following fault types:

### 1. **Loose Joint**
- **Characteristics**: Large thermal anomalies (>10% of image area) in central regions
- **Indication**: Poor electrical connections causing concentrated heating
- **Risk Level**: High - requires immediate attention

### 2. **Wire Overload**
- **Characteristics**: Rectangular thermal patterns (aspect ratio ≥ 2.0)
- **Indication**: Excessive current through conductors
- **Risk Level**: Medium-High - monitor and plan maintenance

### 3. **Point Overload**
- **Characteristics**: Small localized thermal anomalies
- **Indication**: Localized heating at specific points
- **Risk Level**: Medium - investigate further

### 4. **None**
- **Characteristics**: No significant thermal anomalies detected
- **Indication**: Normal thermal profile
- **Risk Level**: Low - continue regular monitoring

## Response Fields Explanation

### Core Analysis Results
- **`prob`**: Overall fault probability (0.0 to 1.0)
- **`histDistance`**: L2 distance between baseline and candidate histograms
- **`dv95`**: 95th percentile of brightness value differences
- **`warmFraction`**: Fraction of pixels classified as "warm"
- **`faultType`**: Primary fault classification

### Bounding Box Information
- **`boxes`**: Array of bounding boxes in format `[x, y, width, height]`
- **`boxInfo`**: Detailed information for each detected region:
  - `x, y, w, h`: Bounding box coordinates and dimensions
  - `areaFrac`: Fraction of total image area
  - `aspect`: Aspect ratio (length/width)
  - `overlapCenterFrac`: Overlap with image center region
  - `label`: Human-readable fault description
  - `boxFault`: Fault type for this specific box

### Image Properties
- **`imageWidth`**, **`imageHeight`**: Dimensions of analyzed images
- **`annotated`**: Base64-encoded annotated image (currently empty, rendered by UI)

## Algorithm Details

### Thermal Anomaly Detection
1. **Color Space Conversion**: RGB → HSV for better thermal analysis
2. **Histogram Comparison**: Statistical comparison between baseline and candidate
3. **Warm Pixel Classification**: Pixels meeting thermal criteria:
   - Hue: Red/orange range (≤0.17 or ≥0.95 in normalized HSV)
   - Saturation: ≥0.35 (vivid colors)
   - Value: ≥0.5 (bright enough)
   - Contrast: Brightness increase ≥0.15 from baseline

### Connected Component Analysis
1. **Region Growing**: Groups adjacent warm pixels into components
2. **Size Filtering**: Removes regions smaller than minimum area threshold
3. **Nested Box Removal**: Eliminates inner boxes with ≥80% overlap

### Fault Classification Logic
Applied in the following priority order:
1. **Loose Joint**: Large central anomalies (≥30% area, ≥40% center overlap)
2. **Point Overload**: All anomalies <30% of image area
3. **Wire Overload**: Rectangular anomalies (aspect ratio ≥2.0)

## Usage Examples

### Example 1: Basic Thermal Analysis
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "baselineImagePath": "/uploads/baseline_image.png",
    "candidateImagePath": "/uploads/thermal_image.png"
  }' \
  http://localhost:8080/api/thermal/analyze
```

### Example 2: Analyze Database Images
```bash
curl -X POST \
  http://localhost:8080/api/thermal/analyze-images/123/456
```

### Example 3: Upload and Analyze
```bash
curl -X POST \
  -F "baselineFile=@baseline.png" \
  -F "candidateFile=@thermal_reading.png" \
  http://localhost:8080/api/thermal/analyze-upload
```

## Integration Notes

### Frontend Integration
- Use `boxes` array to draw overlay rectangles on thermal images
- Color-code boxes based on `boxFault` type
- Display `faultType` as the primary result
- Show `confidence` (prob) as percentage

### Database Storage
- Store analysis results in inspection records
- Link bounding box data to specific thermal readings
- Track fault progression over time

### Monitoring Thresholds
- **Probability > 0.7**: High risk, immediate action required
- **Probability 0.3-0.7**: Medium risk, schedule inspection
- **Probability < 0.3**: Low risk, continue monitoring

## Error Handling

The system handles various error scenarios:

### Common Errors
- **File not found**: Verify image paths exist and are accessible
- **Image format**: Ensure images are valid PNG/JPG files
- **Python script errors**: Check Python environment and dependencies
- **Analysis timeout**: Large images may exceed 30-second timeout

### Error Response Format
```json
{
    "success": false,
    "errorMessage": "Baseline image file not found: /path/to/image.png",
    "prediction": null,
    "confidence": 0.0,
    "processingTimeMs": 150
}
```

## Performance Considerations

- **Image Size**: Larger images require more processing time
- **Concurrent Requests**: Multiple thermal analyses can run simultaneously
- **Memory Usage**: Python process memory scales with image size
- **File Cleanup**: Temporary uploaded files are automatically deleted

## Requirements

### Python Dependencies
The `analyze.py` script requires:
- Python 3.7+
- PIL (Pillow) for image processing
- Standard library modules: json, sys, collections

### Java Dependencies
- Spring Boot 3.x
- Jackson for JSON processing
- Multipart file handling support