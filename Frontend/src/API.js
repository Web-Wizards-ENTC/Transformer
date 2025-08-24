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
