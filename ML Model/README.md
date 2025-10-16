# Thermal Image Analysis for Electrical Equipment Fault Detection

A Python-based thermal image analysis system that combines unsupervised segmentation with thermal pattern recognition to detect faults in electrical equipment such as transformers.

## 🔥 Features

- **Automated Transformer Segmentation**: Uses K-means clustering to isolate electrical equipment from thermal images
- **Thermal Fault Detection**: HSV-based analysis to identify warm regions and thermal anomalies
- **Intelligent Classification**: Categorizes faults into loose joints, wire overloads, and point overloads
- **Bounding Box Generation**: Provides precise coordinates for detected fault regions
- **Visual Results**: Generates annotated images with fault locations highlighted
- **JSON Output**: Structured data output for integration with other systems

## 📋 Requirements

- Python 3.7+
- PIL (Pillow)
- NumPy
- Standard library modules (json, sys, os, collections)

## 🚀 Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd thermal-analysis
```

2. Install required dependencies:

```bash
pip install Pillow numpy
```

## 📖 Usage

### Integrated Analyzer (Recommended)

Use the all-in-one script that combines segmentation and analysis:

```bash
python integrated_analyzer.py baseline_image.jpg candidate_image.jpg
```

### Individual Scripts

Alternatively, use the separate scripts:

1. **Segmentation only**:

```bash
python segment_transformer.py input_image.jpg
```

2. **Thermal analysis** (requires segmentation):

```bash
python analyze.py baseline_image.jpg candidate_image.jpg
```

## 📁 Input Requirements

- **Baseline Image**: Reference thermal image (normal condition)
- **Candidate Image**: Test thermal image (potentially faulty condition)
- **Supported Formats**: JPG, PNG
- **Recommended Size**: 640x640 pixels

## 📊 Output Format

The system outputs JSON data with comprehensive analysis results:

```json
{
  "prob": 0.847,
  "histDistance": 0.146,
  "dv95": 0.992,
  "warmFraction": 0.213,
  "imageWidth": 640,
  "imageHeight": 640,
  "boxes": [
    [20, 181, 8, 187],
    [56, 257, 307, 383],
    [382, 411, 73, 107]
  ],
  "boxInfo": [
    {
      "x": 20,
      "y": 181,
      "w": 8,
      "h": 187,
      "areaFrac": 0.004,
      "aspect": 23.38,
      "overlapCenterFrac": 0.0,
      "label": "Wire overload",
      "boxFault": "wire overload"
    }
  ],
  "faultType": "point overload",
  "segmentedBaseline": "result/baseline_seg.png",
  "segmentedCandidate": "result/candidate_seg.png",
  "saved_image": "result/baseline_vs_candidate_result.jpg",
  "num_boxes": 3
}
```

### Output Parameters

| Parameter      | Description                                                                         |
| -------------- | ----------------------------------------------------------------------------------- |
| `prob`         | Overall fault probability (0-1)                                                     |
| `histDistance` | Color histogram distance between images                                             |
| `dv95`         | 95th percentile brightness difference                                               |
| `warmFraction` | Fraction of pixels identified as warm                                               |
| `boxes`        | Bounding box coordinates [x, y, width, height]                                      |
| `boxInfo`      | Detailed information for each detected fault region                                 |
| `faultType`    | Overall classification: "loose joint", "wire overload", "point overload", or "none" |
| `saved_image`  | Path to annotated result image                                                      |

## 🎯 Fault Types

The system classifies thermal anomalies into three categories:

### 1. **Loose Joint**

- Large central heating areas (≥30% of image)
- Significant overlap with image center (≥40%)
- Typically indicates poor electrical connections

### 2. **Wire Overload**

- Elongated heating patterns (aspect ratio ≥2.0)
- Linear or rectangular thermal signatures
- Indicates current overload in conductors

### 3. **Point Overload**

- Localized heating spots
- Small to medium area coverage (<30%)
- Indicates component-level overheating

## 📁 File Structure

```
thermal-analysis/
├── integrated_analyzer.py      # Main analysis script (recommended)
├── analyze.py                  # Thermal analysis module
├── segment_transformer.py      # Segmentation module
├── debug_open.py              # Utility for testing image loading
├── faulty - classified/        # Sample faulty thermal images
│   ├── T1_faulty_001.jpg
│   └── ...
├── normal - cropped/           # Sample normal thermal images
│   ├── T1_normal_001.jpg
│   └── ...
└── result/                     # Output directory (auto-created)
    ├── *_seg.png              # Segmented images
    └── *_result.jpg           # Annotated results
```

## 🔬 Algorithm Overview

### 1. **Segmentation Pipeline**

- Converts images to feature vectors (RGB + spatial coordinates)
- Applies K-means clustering (default K=4)
- Scores clusters based on contrast and compactness
- Refines masks by removing small components

### 2. **Thermal Analysis**

- Converts images to HSV color space
- Identifies warm regions using hue, saturation, and brightness thresholds
- Performs connected component analysis
- Classifies fault types based on geometric properties

### 3. **Fault Classification**

- Analyzes area coverage and spatial distribution
- Considers aspect ratios and central overlap
- Applies rule-based classification logic
- Generates confidence scores

## 🎨 Visualization

The system generates annotated images showing:

- **Red boxes**: Loose joints
- **Green boxes**: Wire overloads
- **Blue boxes**: Point overloads
- **Labels**: Fault type and area percentage

## ⚙️ Configuration

### Segmentation Parameters

- `k`: Number of clusters (2-8, default: 4)
- `iterations`: K-means iterations (default: 15)
- `seed`: Random seed for reproducibility (default: 42)

### Thermal Analysis Thresholds

- Warm hue range: 0-17% or 95-100% of hue spectrum
- Minimum saturation: 35%
- Minimum brightness: 50%
- Minimum brightness contrast: 15%

## 🐛 Troubleshooting

### Common Issues

1. **"Python was not found"**

   - Use `python` instead of `python3` on Windows
   - Ensure Python is installed and in PATH

2. **Empty output**

   - Check that input images exist and are readable
   - Verify image paths use correct slashes for your OS

3. **No boxes detected**
   - Images may not contain significant thermal differences
   - Try adjusting segmentation parameters
   - Ensure images are thermal (not regular photographs)

### Windows-Specific Notes

- Use `python` command instead of `python3`
- Use backslashes in file paths: `"folder\\image.jpg"`
- PowerShell may truncate output - redirect to file if needed

## 📝 Example Usage

```bash
# Analyze thermal images
python integrated_analyzer.py "normal/baseline.jpg" "faulty/test.jpg"

# With output redirection
python integrated_analyzer.py "normal/baseline.jpg" "faulty/test.jpg" > results.json

# View results
type results.json  # Windows
cat results.json   # Linux/Mac
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Computer vision techniques for thermal image processing
- K-means clustering for unsupervised segmentation
- HSV color space analysis for thermal pattern recognition

## 📞 Support

For questions or issues:

- Create an issue on GitHub
- Check the troubleshooting section above
- Review the example usage patterns

---

**Note**: This system is designed for electrical equipment thermal analysis. Results should be validated by qualified electrical engineers for safety-critical applications.
