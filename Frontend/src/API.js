// API.js
// Utility functions for all API requests (transformers, inspections, etc)

export async function addInspection(inspectionData) {
	// Replace with your actual backend endpoint
	const endpoint = "https://mp13236c6e91f424920a.free.beeceptor.com/api/inspections";
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
	const endpoint = "https://mp13236c6e91f424920a.free.beeceptor.com/api/transformers";
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
