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


