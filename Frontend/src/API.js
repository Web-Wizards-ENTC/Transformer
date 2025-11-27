// Save analysis result to backend
export async function saveAnalysisResult(result, inspectionId) {
	const endpoint = "http://localhost:8080/api/analysis-results";
	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ inspectionId, result }),
		});
		if (!response.ok) {
			throw new Error("Failed to save analysis result");
		}
		return await response.json();
	} catch (error) {
		console.error("Save analysis result error:", error);
		throw error;
	}
}
// API.js
// Utility functions for all API requests 

// Fetch all inspections from backend
export async function getInspections() {
	const endpoint = "http://localhost:8080/api/inspections";
	try {
		const response = await fetch(endpoint);
		if (!response.ok) {
			throw new Error('Failed to fetch inspections');
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Fetch all transformers from backend
export async function getTransformers() {
	const endpoint = "http://localhost:8080/api/transformers";
	try {
		const response = await fetch(endpoint);
		if (!response.ok) {
			throw new Error('Failed to fetch transformers');
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function addInspection(inspectionData) {
	// Replace with your actual backend endpoint
	const endpoint = "http://localhost:8080/api/inspections";
	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(inspectionData),
		});
		if (!response.ok) {
			throw new Error('Failed to add inspection');
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function addTransformer(transformerData) {
	// Replace with your actual backend endpoint
	const endpoint = "http://localhost:8080/api/transformers";
	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(transformerData),
		});
		if (!response.ok) {
			throw new Error('Failed to add transformer');
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function uploadTransformerCurrent(imageFile, inspectionId) {
	const endpoint = "http://localhost:8080/api/images";

	try {
		// Create FormData and append file + inspectionId
		const formData = new FormData();
		formData.append("file", imageFile);
		formData.append("inspectionId", inspectionId);

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to upload thermal image");
		}

		return await response.json(); // returns the InspectionImage object
	} catch (error) {
		console.error(error);
		throw error;
	}
}


export async function uploadTransformerBase(imageFile, inspectionId) {
	const endpoint = "http://localhost:8080/api/images";
	try {
		const formData = new FormData();
		formData.append("inspectionId", inspectionId); // must be inspectionId
		formData.append("file", imageFile);            // must be file

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to upload image");
		}

		return await response.json(); // returns the InspectionImage object (including its id)
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function getTransformerCurrentImage(imageId) {
	const endpoint = `http://localhost:8080/api/images/${imageId}`;

	try {
		const response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error("Failed to fetch thermal image");
		}

		// Get image as a Blob
		const blob = await response.blob();

		// Convert blob to an object URL so React can display it
		const imageUrl = URL.createObjectURL(blob);
		return imageUrl;
	} catch (error) {
		console.error(error);
		throw error;
	}
}



export async function getTransformerBaseImage(imageId) {
	const endpoint = `http://localhost:8080/api/images/${imageId}`;
	try {
		const response = await fetch(endpoint);
		if (!response.ok) {
			throw new Error("Failed to fetch image");
		}
		const blob = await response.blob();
		return URL.createObjectURL(blob);
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// ========== THERMAL ANALYSIS ML FUNCTIONS ==========

// Analyze thermal images with uploaded files
export async function analyzeThermalImagesUpload(baselineFile, candidateFile) {
	const endpoint = "http://localhost:8080/api/thermal/analyze-upload";
	try {
		const formData = new FormData();
		formData.append("baselineFile", baselineFile);
		formData.append("candidateFile", candidateFile);

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to analyze thermal images");
		}

		return await response.json();
	} catch (error) {
		console.error("Thermal analysis error:", error);
		throw error;
	}
}

// Analyze thermal images using stored image IDs
export async function analyzeThermalImagesById(baselineId, candidateId) {
	const endpoint = `http://localhost:8080/api/thermal/analyze-images/${baselineId}/${candidateId}`;
	try {
		const response = await fetch(endpoint, {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error("Failed to analyze thermal images by ID");
		}

		return await response.json();
	} catch (error) {
		console.error("Thermal analysis by ID error:", error);
		throw error;
	}
}

// Analyze with baseline upload and candidate from database
export async function analyzeThermalImageWithBaseline(candidateId, baselineFile) {
	const endpoint = `http://localhost:8080/api/thermal/analyze-with-baseline/${candidateId}`;
	try {
		const formData = new FormData();
		formData.append("baselineFile", baselineFile);

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to analyze thermal image with baseline");
		}

		return await response.json();
	} catch (error) {
		console.error("Thermal analysis with baseline error:", error);
		throw error;
	}
}

// General thermal analysis with JSON request
export async function analyzeThermalImages(baselineImagePath, candidateImagePath, parameters = {}) {
	const endpoint = "http://localhost:8080/api/thermal/analyze";
	try {
		const requestBody = {
			baselineImagePath,
			candidateImagePath,
			parameters,
			modelType: "thermal_analysis"
		};

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error("Failed to analyze thermal images");
		}

		return await response.json();
	} catch (error) {
		console.error("Thermal analysis error:", error);
		throw error;
	}
}

// Legacy ML prediction functions (for backward compatibility)
export async function predictML(imagePath, modelType = "default", parameters = {}) {
	const endpoint = "http://localhost:8080/api/ml/predict";
	try {
		const requestBody = {
			imagePath,
			modelType,
			parameters
		};

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error("Failed to make ML prediction");
		}

		return await response.json();
	} catch (error) {
		console.error("ML prediction error:", error);
		throw error;
	}
}

export async function predictMLFromUpload(file, modelType = "default") {
	const endpoint = "http://localhost:8080/api/ml/predict-upload";
	try {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("modelType", modelType);

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to make ML prediction from upload");
		}

		return await response.json();
	} catch (error) {
		console.error("ML prediction from upload error:", error);
		throw error;
	}
}

// Add API functions for new endpoints

export async function addGeneralRecord(generalRecord) {
    const endpoint = "http://localhost:8080/api/general-records";
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(generalRecord),
        });
        if (!response.ok) {
            throw new Error("Failed to add general record");
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding general record:", error);
        throw error;
    }
}

export async function addMaintenanceRecord(maintenanceRecord) {
    const endpoint = "http://localhost:8080/api/maintenance-records";
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(maintenanceRecord),
        });
        if (!response.ok) {
            throw new Error("Failed to add maintenance record");
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding maintenance record:", error);
        throw error;
    }
}

export async function addWorkDataSheet(workDataSheet) {
    const endpoint = "http://localhost:8080/api/work-data-sheets";
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(workDataSheet),
        });
        if (!response.ok) {
            throw new Error("Failed to add work data sheet");
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding work data sheet:", error);
        throw error;
    }
}


