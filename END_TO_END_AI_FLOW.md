# The End-to-End AI Analysis Flow

This document outlines the complete, step-by-step process of how a user's request on the frontend triggers an AI model on the backend, and how the results are returned and displayed. The flow is broken down into four main stages.

---

### 1. Frontend (React): Kicking Off the Analysis

It all starts in the user's browser with your React application. The user wants to compare two thermal images.

*   **User Action:** On the "Thermal Analysis" page, the user selects a "Baseline Image" and a "Candidate Image" using file upload inputs.
*   **Triggering the Call:** The user clicks the "Analyze Images" button. This action triggers a handler function in the React component.
*   **Making the API Request:** This handler calls the `analyzeThermalImagesUpload` function from `src/API.js`. This function is responsible for communicating with your Java backend.
*   **Sending the Data:** The API function creates a `FormData` object, appends the two image files, and sends an HTTP `POST` request to the backend endpoint: `/api/thermal/analyze-upload`.

**File: `c:\Users\ASUS\Downloads\Transformer\Frontend\src\API.js`**
```javascript
// This function sends the two images to the backend.
export async function analyzeThermalImagesUpload(baselineFile, candidateFile) {
	const endpoint = "http://localhost:8080/api/thermal/analyze-upload";
	try {
		const formData = new FormData();
		// The keys "baselineFile" and "candidateFile" must match what the backend @RequestParam expects.
		formData.append("baselineFile", baselineFile);
		formData.append("candidateFile", candidateFile);

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData, // The images are sent in the request body.
		});

		if (!response.ok) {
			throw new Error("Failed to analyze thermal images");
		}

		return await response.json(); // Returns the analysis results from the backend.
	} catch (error) {
		console.error("Thermal analysis error:", error);
		throw error;
	}
}
```

---

### 2. Backend (Java): Receiving the Request and Calling Python

Your Java Spring Boot application now takes over.

*   **Receiving the Request:** The `POST` request is caught by the `analyzeThermalImagesFromUpload` method in `MainController.java`, which is mapped to the `/api/thermal/analyze-upload` endpoint.
*   **Saving Files Temporarily:** The controller saves the uploaded `baselineFile` and `candidateFile` to a local `/uploads/` directory. This is a crucial step because the Python script needs file paths to read the images from the disk.
*   **Delegating to the Service:** The controller then calls the `analyzeThermalImages` method in the `PythonMLService`, which contains the core logic for interacting with the Python script.

**File: `c:\Users\ASUS\Downloads\Transformer\Backend\src\main\java\com\webwizards\transformerApp\controller\MainController.java`**
```java
@PostMapping("/thermal/analyze-upload")
public ResponseEntity<MLPredictionResponse> analyzeThermalImagesFromUpload(
        @RequestParam("baselineFile") MultipartFile baselineFile,
        @RequestParam("candidateFile") MultipartFile candidateFile) throws IOException {
    try {
        // Save both files temporarily
        String folder = System.getProperty("user.dir") + "/uploads/";
        // ... (code to create unique file names)
        String baselineFilePath = folder + baselineFileName;
        String candidateFilePath = folder + candidateFileName;
        
        baselineFile.transferTo(new File(baselineFilePath));
        candidateFile.transferTo(new File(candidateFilePath));
        
        // Create thermal analysis request
        MLPredictionRequest request = new MLPredictionRequest();
        request.setBaselineImagePath(baselineFilePath);
        request.setCandidateImagePath(candidateFilePath);
        
        // Perform thermal analysis
        MLPredictionResponse response = pythonMLService.analyzeThermalImages(request);
        
        // Clean up temporary files
        new File(baselineFilePath).delete();
        new File(candidateFilePath).delete();
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        // ... error handling
    }
}
```

---

### 3. The AI Model (Python): Python Script Execution

This is where the actual AI processing happens, orchestrated by the `PythonMLService`.

*   **Building the Command:** The service constructs a command-line string to run the Python script (`ml_models/analyze.py`), passing the absolute paths of the two temporary images as arguments.
*   **Running the Script:** Java's `ProcessBuilder` executes this command, running the Python script as a separate operating system process.
*   **Python's Job:** The `analyze.py` script performs the thermal analysis:
    1.  It reads the two image files.
    2.  It compares them using image processing and machine learning techniques.
    3.  It identifies anomalies (hotspots) and classifies potential faults (`Loose Joint`, `Wire Overload`, etc.).
    4.  It generates bounding boxes for the detected faults.
*   **Outputting Results:** The Python script prints its findings to the standard output as a **single line of JSON**. This is the critical communication channel back to the Java application.

**File: `c:\Users\ASUS\Downloads\Transformer\Backend\src\main\java\com\webwizards\transformerApp\service\PythonMLService.java`**
```java
public MLPredictionResponse analyzeThermalImages(MLPredictionRequest request) {
    // ...
    try {
        // 1. Build the command to execute the Python script.
        String pythonCommand = buildThermalAnalysisCommand(request);
        
        // 2. Execute the command as a new process.
        ProcessBuilder processBuilder = new ProcessBuilder();
        processBuilder.command(pythonCommand.split("\\s+"));
        Process process = processBuilder.start();
        
        // 3. Read the JSON output from the script's standard output.
        String output = readProcessOutput(process.getInputStream());
        
        // ... (wait for process to finish and handle errors)
        
        // 4. Parse the JSON string into a Java object (MLPredictionResponse).
        return parseThermalAnalysisResponse(output, processingTime);
        
    } catch (Exception e) {
        // ... error handling
    }
}
```

---

### 4. Backend to Frontend: Displaying the Results

The flow now reverses, bringing the analysis results back to the user.

*   **Parsing the Response:** The `PythonMLService` receives the JSON string from the Python script. It uses `ObjectMapper` to parse this JSON into a strongly-typed `MLPredictionResponse` Java object.
*   **Returning to Controller:** The service returns this `MLPredictionResponse` object to the `MainController`.
*   **Sending to Frontend:** The controller places the `MLPredictionResponse` object in a `ResponseEntity` and sends it back to the frontend. Spring Boot automatically serializes the Java object back into a JSON string.
*   **Updating the UI:** Back in the React component, the `await` call on `fetch` completes. The JSON response is received and stored in the component's state (e.g., `setResults(analysisResults)`).
*   **Rendering the Data:** React detects the state change and re-renders the component. The UI now displays the information from the `results` object, showing the `faultType`, `confidence`, and drawing the bounding `boxes` over the candidate image.

**File: `c:\Users\ASUS\Downloads\Transformer\Frontend\FRONTEND_ML_INTEGRATION.md` (Example)**
```javascript
// Render bounding boxes on images
{analysisResults?.boxes && analysisResults.boxes.map((box, index) => {
  const [x, y, w, h] = box;
  
  return (
    <div
      key={index}
      className="absolute border-2 border-red-500"
      style={{ left: x, top: y, width: w, height: h }}
    />
  );
})}
```
