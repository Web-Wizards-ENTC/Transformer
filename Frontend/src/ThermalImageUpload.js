import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

export default function ThermalImageUpload({ inspection }) {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [weather, setWeather] = useState("Sunny");
	const [thermalImage, setThermalImage] = useState(null);
	const [showComparison, setShowComparison] = useState(false);
	const [baselineImage, setBaselineImage] = useState(null);
	const [baselineDateTime, setBaselineDateTime] = useState(""); // added
	const [currentDateTime, setCurrentDateTime] = useState("");   // added

	const inputRef = useRef(null);
	const uploadInterval = useRef(null);

	// Simulate baseline image (replace with actual fetch if needed)
	useEffect(() => {
		setBaselineImage("/Transformer-Base.jpg"); // Example static image
		const now = new Date();
		setBaselineDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`); // set baseline datetime
	}, []);

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		setUploading(true);
		setProgress(0);
		setThermalImage(file);

		// Build FormData
		const formData = new FormData();
		formData.append("inspectionId", inspection.id);   // 👈 must exist in DB
		formData.append("file", file);

		try {
			const response = await axios.post("http://localhost:8080/api/images", formData, {
				headers: { "Content-Type": "multipart/form-data" },
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					setProgress(percentCompleted);
				},
			});

			// If upload succeeded
			console.log("Uploaded image:", response.data);
			setUploading(false);
			setShowComparison(true);

			// Set current datetime
			const now = new Date();
			setCurrentDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
		} catch (error) {
			console.error("Upload failed:", error);
			setUploading(false);
		}
	};

	const handleCancelUpload = () => {
		clearInterval(uploadInterval.current);
		setUploading(false);
		setProgress(0);
		setThermalImage(null);
		setCurrentDateTime(""); // reset current datetime
	};

	return (
		<>
			{/* Upload Form Section - half width */}
			{!uploading && !showComparison && (
				<div className="bg-white rounded-2xl shadow p-8 w-1/2 min-w-[400px] flex flex-col gap-6 transition-all duration-300" style={{alignItems: 'flex-start', minHeight: '500px'}}>
					<div className="flex items-center justify-between w-full mb-2">
						<h3 className="text-xl font-bold text-gray-800">Thermal Image</h3>
						<span className={`px-3 py-1 rounded text-xs font-semibold ${inspection?.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
							{inspection?.status === 'Pending' ? 'Pending' : 'In progress'}
						</span>
					</div>
					<p className="text-gray-600 mb-4">Upload a thermal image of the transformer to identify potential issues.</p>
					<label className="text-base font-semibold text-gray-800 mb-2 block">Weather Condition</label>
					<select value={weather} onChange={e => setWeather(e.target.value)} className="border rounded px-4 py-2 mb-6 w-full text-gray-700 bg-gray-50">
						<option value="Sunny">Sunny</option>
						<option value="Cloudy">Cloudy</option>
						<option value="Rainy">Rainy</option>
					</select>
					<button className="w-full bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold text-base hover:bg-indigo-800 transition" onClick={() => inputRef.current.click()}>
						Upload thermal Image
					</button>
					<input type="file" ref={inputRef} className="hidden" onChange={handleFileChange} />
				</div>
			)}
			{/* Uploading State - half width */}
			{uploading && (
				<div className="bg-white rounded-2xl shadow p-8 w-1/2 min-w-[400px] flex flex-col gap-6 transition-all duration-300" style={{alignItems: 'flex-start', minHeight: '500px'}}>
					<div className="flex flex-col items-center justify-center h-full w-full">
						<h3 className="text-xl font-bold text-gray-800 mb-4">Thermal image uploading.</h3>
						<p className="text-gray-600 mb-4">Thermal image is being uploaded and reviewed.</p>
					</div>
					<div className="mb-2 flex justify-end w-full">
						<span className="text-sm text-gray-700 font-medium">{progress}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
						<div className="bg-indigo-700 h-4 transition-all duration-200" style={{ width: `${progress}%` }}></div>
					</div>
					<button className="bg-white text-gray-600 px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 w-auto" onClick={handleCancelUpload}>
						Cancel
					</button>
				</div>
			)}
			{/* Comparison State - full width */}
			{showComparison && !uploading && (
				<div className="bg-white rounded-2xl shadow p-8 w-full flex flex-col gap-6 transition-all duration-300" style={{minHeight: '500px'}}>
					<h3 className="text-xl font-bold text-gray-800 mb-4">Thermal Image Comparison</h3>
					<div className="grid grid-cols-2 gap-8 w-full">
						{/* Baseline Image */}
						<div className="relative w-full flex flex-col items-center">
							<div className="relative w-full max-w-md h-72 flex items-center justify-center">
								<img src={baselineImage} alt="Baseline" className="w-full h-72 object-cover rounded-lg bg-gray-100" />
								<span className="absolute top-0 left-0 mt-4 ml-4 bg-indigo-700 text-white text-sm px-3 py-1 rounded shadow">Baseline</span>
							</div>
							<span className="text-xs text-gray-500 mt-1">{baselineDateTime}</span>
						</div>
						{/* Current Image */}
						<div className="relative w-full flex flex-col items-center">
							<div className="relative w-full max-w-md h-72 flex items-center justify-center">
								<img src={thermalImage ? URL.createObjectURL(thermalImage) : "/Transformer-Current.jpg"} alt="Current" className="w-full h-72 object-cover rounded-lg bg-gray-100" />
								<span className="absolute top-0 left-0 mt-4 ml-4 bg-indigo-700 text-white text-sm px-3 py-1 rounded shadow">Current</span>
							</div>
							<span className="text-xs text-gray-500 mt-1">{currentDateTime}</span>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
