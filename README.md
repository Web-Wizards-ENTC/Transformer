# Transformer Thermal Inspection System

---

## Overview
This project is a web-based system for managing transformers and their associated thermal imaging data.  

- **Phase 1** focused on building the foundational components: an admin interface for managing transformer records, an image upload mechanism, and a system for categorizing baseline images by environmental conditions.  
- **Phase 2** extends the system with **AI-based anomaly detection** capabilities, allowing automated comparison between baseline and maintenance images, highlighting potential issues, and presenting results in an interactive analysis page.  

Power utilities can use this system to digitize their thermal inspection workflow, providing a strong basis for automated anomaly detection and predictive maintenance planning.

---

## Features Implemented

### Phase 1
* **FR1.1: Admin Interface for Transformer Management**
  * Add new transformer records by entering details like region, transformer number, pole number, type, and location.
  * View all existing transformer records in a searchable and filterable table.
  * Edit and delete existing transformer records.

* **FR1.2: Thermal Image Upload and Tagging**
  * Upload thermal images directly to specific transformer entries.
  * Tag images as either **Baseline** (for future comparison) or **Maintenance** (for current inspection).
  * Images are stored with essential metadata, including the upload date/time, image type, and uploader.

* **FR1.3: Categorization by Environmental Conditions**
  * When uploading a baseline image, users must tag it with the observed environmental condition: **Sunny**, **Cloudy**, or **Rainy**.
  * This condition is selected using a dropdown menu during the upload process.

---

### Phase 2
* **FR2.1: AI-Based Anomaly Detection Engine**
  * When both baseline and maintenance images are uploaded, the system automatically compares them.
  * Detects anomalies such as **hotspots**, **asymmetries**, or **temperature deviations**.
  * Uses a thresholding mechanism (default: 10% deviation) to flag anomalies.

* **FR2.2: Thermal Image Analysis Page**
  * After upload, users are redirected to the **Thermal Analysis Page**.
  * The baseline and maintenance images are displayed **side by side**.
  * Interactive controls include:
    - **Zoom In / Zoom Out**
    - **Drag (click & hold to move image)**
    - **Reset (return to default view)**
  * Anomalous regions are highlighted with **color-coded overlays** (bounding boxes, heatmaps, or markers).

* **FR2.3: Automatic Anomaly Marking**
  * Detected anomalies are annotated with metadata:
    - **Pixel coordinates**
    - **Anomaly size**
    - **Severity score**
    - **Confidence level**
    - **Detection date**
  * If no anomalies are found, results are displayed as: **Normal**.

* **FR2.4: Ruleset Configuration**
  * A new button **“Error Ruleset”** is available.
  * Clicking this opens a **popup window** where users can:
    - Set or adjust anomaly detection thresholds
    - Define error rules (e.g., deviation > 12% = severe anomaly)
   
* **FR2.5: Adding Notes**
  * Users can add custom notes under the analysis results.
  * Clicking **Confirm** saves the notes to the inspection record for future reference.

### Phase 3  

* **FR3.1: Interactive Annotation Tools**  
  * On the anomaly detection view, users can **interactively modify anomaly markers**.  
  * Supported interactions include:  
    - **Resize / Reposition** existing markers.  
    - **Delete** incorrectly detected anomalies.  
    - **Add new markers** by drawing **bounding boxes** or **polygonal regions**.  
  * Each annotation must include:  
    - **Annotation Type:** Added / Edited / Deleted  
    - **Comments or Notes:** Optional user remarks  
    - **Timestamp:** Date and time of action  
    - **User ID:** Identifier of the annotator  

* **FR3.2: Metadata and Annotation Persistence**  
  * All annotation interactions are **automatically saved** in the backend with the following metadata:  
    - **User ID**  
    - **Timestamp**  
    - **Image ID**  
    - **Transformer ID**  
    - **Action Taken**  
  * The **saved state** is instantly reflected in the **UI**.  
  * When revisiting the same image, **existing annotations are automatically reloaded** and displayed for continuity.  

* **FR3.3: Feedback Integration for Model Improvement**  
  * The system maintains a **feedback log** containing both:  
    - **Original AI-generated detections**  
    - **Final user-modified annotations**  
  * The feedback log is used for **model validation** and **retraining** to enhance accuracy.  
  * Users can **export the feedback log** in **JSON** or **CSV** format, including:  
    - **Image ID**  
    - **Model-Predicted Anomalies**  
    - **Final Accepted Annotations**  
    - **Annotator Metadata** (User ID, Timestamp, etc.)  
  * **User-modified annotations** directly contribute to improving the model’s detection performance over time.  

---

## Setup Instructions

This project consists of two separate components: a backend server (**Spring Boot**) and a frontend application (**React**).

### Prerequisites
* Java (JDK 17+)
* Maven
* Node.js (v18+)
* npm or yarn package manager
* PostgreSQL (v14+)

### Backend Setup (Spring Boot)
1. Navigate to the `Backend` directory:
    ```sh
    cd Backend
    ```
2. The backend is configured to connect to a PostgreSQL database.  
   Edit the `src/main/resources/application.properties` file to match your database credentials.
3. Run the backend server:
    ```sh
    mvn spring-boot:run
    ```
4. The backend REST API will start on `http://localhost:8080`.

### Frontend Setup (React)
1. Navigate to the `Frontend` directory:
    ```sh
    cd Frontend
    ```
2. Install the required dependencies:
    ```sh
    npm install
    ```
3. Start the frontend development server:
    ```sh
    npm start
    ```
4. Open your web browser and go to `http://localhost:3000` to access the application.

---

## User Instructions

### Phase 1
* **Managing Transformers:**  
  On the main `Transformers` page, you can see a table of all existing transformers.  
  To add a new one, click the **'Add Transformer'** button, fill in the details, and click **'Confirm'**.  
  You can also use the **'View'** button next to any transformer to see its associated inspections.

  ![](Images/1.png)

* **Viewing and Adding Inspections:**  
  From the `Transformers` page, click the **'View'** button for a specific transformer to go to its inspection page.  
  To add a new inspection, click **'Add Inspection'**, enter the details, and click **'Confirm'**.

  ![](Images/2.png)
  ![](Images/3.png)

* **Uploading Thermal Images:**  
  On an inspection page:
  * Select the **weather condition** from the dropdown menu (Sunny, Cloudy, or Rainy).  
  * Click **'Upload thermal image'** for maintenance images.  
  * Use the **'Baseline image'** button for baseline uploads.  
  * Once both are uploaded, the system displays them for comparison.

---

### Phase 2
1. Upload both **baseline** and **maintenance** images.  
![](Images/5.jpeg)
![](Images/6.jpeg)
2. The system redirects to the **Thermal Analysis Page**.  
![](Images/7.jpeg)
3. Review detected anomalies (or "Normal" if none found).  
![](Images/8.jpeg)
4. Use **zoom, drag, reset** for image navigation.  
5. Open **Error Ruleset** to configure thresholds.  
![](Images/9.png)
6. Review analysis results with metadata.  
7. Add **notes** and save with **Confirm**.  
![](Images/10.png)

---

## Known Limitations / Issues
* **Phase 1:**  
  - User authentication not implemented (anyone can access/modify records).  
  - File validation (size/type) is minimal.  

* **Phase 2:**  
  - Detection accuracy depends on model training data.  
  - Current ruleset supports only predefined thresholds.  
  - Inference time may vary for larger image sets.  


---

## API Endpoints Used

The frontend calls several backend endpoints. Below is a concise table of the key endpoints used by the React app and a short description of what each does.

| Endpoint | Method | Purpose |
|---|---:|---|
| /api/inspections | GET | Fetch list of inspections. |
| /api/inspections | POST | Create a new inspection record. |
| /api/transformers | GET | Fetch list of transformers. |
| /api/transformers | POST | Create a new transformer record. |
| /api/images | POST | Upload an image (baseline or maintenance) — expects multipart/form-data with `file` and `inspectionId`. Returns image metadata. |
| /api/images/{imageId} | GET | Download a specific image blob by id (used to display images). |
| /api/thermal/analyze-upload | POST | Analyze two uploaded images (multipart form fields `baselineFile` and `candidateFile`) — returns ML analysis results (boxes, boxInfo, fault types, etc.). |
| /api/thermal/analyze-images/{baselineId}/{candidateId} | POST | Analyze images already stored on the server by their IDs. |
| /api/thermal/analyze-with-baseline/{candidateId} | POST | Analyze a stored candidate image using an uploaded baseline file (multipart with `baselineFile`). |
| /api/thermal/analyze | POST | Generic analysis endpoint accepting JSON paths and parameters for analysis. |
| /api/ml/predict | POST | Legacy ML prediction endpoint (JSON body). |
| /api/ml/predict-upload | POST | Legacy ML prediction from an uploaded image (multipart form). |

Notes:
- All endpoints are prefixed with `http://localhost:8080` in development (see `Frontend/src/API.js`).
- The thermal analysis endpoints return a JSON object containing analysis metadata such as `boxes`, `boxInfo`, `faultType`, `confidence`, and `processingTimeMs`.



