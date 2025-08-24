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

export async function uploadTransformerCurrent(imageFile, text1, text2) {
	const endpoint = "http://localhost:8080/api/transformersBase";

	try {
		// Create FormData and append both file + texts
		const formData = new FormData();
		formData.append("image", imageFile);  // file
		formData.append("text1", text1);      // first text
		formData.append("text2", text2);      // second text

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,  // send as multipart/form-data
		});

		if (!response.ok) {
			throw new Error("Failed to upload data");
		}

		return await response.json(); // adjust if backend returns text
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function uploadTransformerBase(imageFile, text1) {
	const endpoint = "http://localhost:8080/api/transformersCurrent";

	try {
		// Create FormData and append both file + texts
		const formData = new FormData();
		formData.append("image", imageFile);  // file
		formData.append("text1", text1);      // first text

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,  // send as multipart/form-data
		});

		if (!response.ok) {
			throw new Error("Failed to upload data");
		}

		return await response.json(); // adjust if backend returns text
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function getTransformerCurrentImage(text1, text2) {
	const endpoint = "http://localhost:8080/api/transformersCurrentgetImage";

	try {
		const formData = new FormData();
		formData.append("text1", text1);
		formData.append("text2", text2);

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to fetch image");
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


export async function getTransformerBaseImage(text1) {
	const endpoint = "http://localhost:8080/api/transformersBasegetImage";

	try {
		const formData = new FormData();
		formData.append("text1", text1);

		const response = await fetch(endpoint, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to fetch image");
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


