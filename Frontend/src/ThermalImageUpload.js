import React, { useRef, useState, useEffect } from "react";
import { analyzeThermalImagesUpload, uploadTransformerCurrent, uploadTransformerBase, saveAnalysisResult } from "./API";
// previous notes file removed to avoid showing preloaded notes
import ThermalAnalysis from "./ThermalAnalysis";

export default function ThermalImageUpload({ inspection }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [weather, setWeather] = useState("Sunny");
  const [thermalImage, setThermalImage] = useState(null);
  const [baselineImageFile, setBaselineImageFile] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [baselineImage, setBaselineImage] = useState(null);
  const [baselineDateTime, setBaselineDateTime] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [tool, setTool] = useState(null);
  const [showRuleset, setShowRuleset] = useState(false);
  
  // ML Analysis Results
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [rule2Enabled, setRule2Enabled] = useState(false);
  const [rule3Enabled, setRule3Enabled] = useState(false);
  const [tempDiff, setTempDiff] = useState("10%");

  const [imageStates, setImageStates] = useState({
    baseline: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
    current: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
  });

  const baselineInputRef = useRef(null);
  const thermalInputRef = useRef(null);
  const uploadInterval = useRef(null);


  useEffect(() => {
    // Remove default baseline image setup since user will upload it
    const now = new Date();
    setBaselineDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
  }, []);

  const handleBaselineUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setBaselineImageFile(file);
    setBaselineImage(URL.createObjectURL(file));
    const now = new Date();
    setBaselineDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
  };

  const handleThermalUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setThermalImage(file);
    const now = new Date();
    setCurrentDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
    
    // Check if both images are ready for comparison
    if (baselineImageFile) {
      startComparison();
    }
  };

  const startComparison = async () => {
    if (!baselineImageFile || !thermalImage) {
      setAnalysisError("Both baseline and thermal images are required");
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    uploadInterval.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 2, 100);
        if (next >= 100) {
          clearInterval(uploadInterval.current);

          // leave progress at 100 briefly so users can see the completed bar,
          // then switch views and start analysis after a short pause (500ms)
          setTimeout(() => {
            setUploading(false);
            setShowComparison(true);
            // Start ML analysis after showing comparison
            performThermalAnalysis();
          }, 500);
        }
        return next;
      });
    }, 100);
  };

  const performThermalAnalysis = async () => {
    if (!baselineImageFile || !thermalImage) {
      setAnalysisError("Both baseline and thermal images are required for analysis");
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResults(null);

    try {
      // Call the ML analysis API with both uploaded files
      const results = await analyzeThermalImagesUpload(baselineImageFile, thermalImage);
      setAnalysisResults(results);

      // Save the analysis result to the backend (optional: pass inspection?.inspectionNo or .id)
      if (inspection && inspection.inspectionNo) {
        try {
          await saveAnalysisResult(results, inspection.inspectionNo);
        } catch (saveError) {
          console.error('Failed to save analysis result:', saveError);
        }
      }
    } catch (error) {
      console.error('Thermal analysis failed:', error);
      setAnalysisError(`Analysis failed: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCancelUpload = () => {
    clearInterval(uploadInterval.current);
    setUploading(false);
    setProgress(0);
    setThermalImage(null);
    setBaselineImageFile(null);
    setBaselineImage(null);
    setCurrentDateTime("");
    setBaselineDateTime("");
    setAnalysisResults(null);
    setAnalysisError(null);
    setShowComparison(false);
  };

  const handleReset = () => {
    setImageStates({
      baseline: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
      current: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
    });
    setTool(null);
  };

  const handleStartOver = () => {
    setShowComparison(false);
    setThermalImage(null);
    setBaselineImageFile(null);
    setBaselineImage(null);
    setAnalysisResults(null);
    setAnalysisError(null);
    setAnalyzing(false);
    setCurrentDateTime("");
    setBaselineDateTime("");
    handleReset();
  };

  const handleImageClick = (e, key) => {
    if (tool !== "zoom") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setImageStates((prev) => {
      const img = prev[key];
      const newZoom = img.zoom >= 3 ? 1 : img.zoom + 0.5;
      const scale = newZoom / img.zoom;
      const newOffset = {
        x: img.offset.x - x * (scale - 1),
        y: img.offset.y - y * (scale - 1),
      };
      return {
        ...prev,
        [key]: { ...img, zoom: newZoom, offset: newOffset },
      };
    });
  };

  const handleMouseDown = (e, key) => {
    if (tool !== "drag") return;
    setImageStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        dragging: true,
        startPos: { x: e.clientX - prev[key].offset.x, y: e.clientY - prev[key].offset.y },
      },
    }));
  };

  const handleMouseMove = (e, key) => {
    setImageStates((prev) => {
      const img = prev[key];
      if (!img.dragging || tool !== "drag") return prev;
      return {
        ...prev,
        [key]: { ...img, offset: { x: e.clientX - img.startPos.x, y: e.clientY - img.startPos.y } },
      };
    });
  };

  const handleMouseUp = (key) => {
    setImageStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], dragging: false },
    }));
  };

  const getImageStyle = (key) => {
    const { zoom, offset, dragging } = imageStates[key];
    return {
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
      transformOrigin: "center",
      transition: dragging ? "none" : "transform 0.2s ease",
      cursor: tool === "drag" ? "grab" : tool === "zoom" ? "zoom-in" : "default",
    };
  };

  // Notes Handlers
  // note handlers removed

  // 🔥 Legend Component (outside image)
// 🔥 Legend Component (outside image)
	const Legend = () => {
	const minTemp = 20;
	const maxTemp = 300;
	const steps = 8;
	const stepValue = (maxTemp - minTemp) / steps;

	// Generate labels, then reverse them so 20°C is bottom, 300°C is top
	const labels = Array.from({ length: steps + 1 }, (_, i) => minTemp + i * stepValue).reverse();

	return (
		<div className="flex flex-row items-center ml-2">
		{/* Gradient bar */}
		<div
			className="w-4 h-72 rounded"
			style={{
			background: "linear-gradient(to top, blue, cyan, green, yellow, orange, red)",
			border: "1px solid #555",
			}}
		/>
		{/* Labels aligned with gradient */}
		<div className="flex flex-col justify-between h-72 ml-2 text-xs font-semibold text-gray-700">
			{labels.map((t, i) => (
			<div key={i} className="flex items-center" style={{ height: "12.5%" }}>
				<span>{Math.round(t)}°C</span>
			</div>
			))}
		</div>
		</div>
	);
	};


  return (
    <>
      {/* Upload Interface */}
      {!uploading && !showComparison && (
        <div
          className="bg-white rounded-2xl shadow p-8 w-full max-w-4xl flex flex-col gap-6 transition-all duration-300"
          style={{ minHeight: "500px" }}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <h3 className="text-xl font-bold text-gray-800">Thermal Image Analysis</h3>
            <span
              className={`px-3 py-1 rounded text-xs font-semibold ${
                inspection?.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {inspection?.status === "Pending" ? "Pending" : "In progress"}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">
            Upload both baseline and thermal images of the transformer to identify potential issues.
          </p>

          {/* Weather Condition */}
          <div className="mb-4">
            <label className="text-base font-semibold text-gray-800 mb-2 block">
              Weather Condition
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="border rounded px-4 py-2 w-full text-gray-700 bg-gray-50"
            >
              <option value="Sunny">Sunny</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Rainy">Rainy</option>
            </select>
          </div>

          {/* Image Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline Image Upload */}
            <div>
              <label className="text-base font-semibold text-gray-800 mb-2 block">
                Baseline Image
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  baselineImageFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => baselineInputRef.current?.click()}
              >
                {baselineImageFile ? (
                  <div className="space-y-2">
                    <div className="text-green-600">
                      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-800">{baselineImageFile.name}</p>
                    <p className="text-xs text-green-600">Baseline image uploaded</p>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload baseline image</p>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={baselineInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleBaselineUpload}
              />
            </div>

            {/* Thermal Image Upload */}
            <div>
              <label className="text-base font-semibold text-gray-800 mb-2 block">
                Thermal Image
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  thermalImage ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => thermalInputRef.current?.click()}
              >
                {thermalImage ? (
                  <div className="space-y-2">
                    <div className="text-green-600">
                      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-800">{thermalImage.name}</p>
                    <p className="text-xs text-green-600">Thermal image uploaded</p>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm">Click to upload thermal image</p>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={thermalInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleThermalUpload}
              />
            </div>
          </div>

          {/* Analysis Button */}
          <button
            className={`w-full px-4 py-3 rounded-lg font-semibold text-base transition ${
              baselineImageFile && thermalImage
                ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={startComparison}
            disabled={!baselineImageFile || !thermalImage}
          >
            {baselineImageFile && thermalImage ? 'Start Thermal Analysis' : 'Upload Both Images to Continue'}
          </button>
        </div>
      )}

      {/* Uploading */}
      {uploading && (
        <div
          className="bg-white rounded-2xl shadow p-8 w-full max-w-2xl flex flex-col gap-6 transition-all duration-300"
          style={{ minHeight: "400px" }}
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Processing Thermal Analysis</h3>
            <p className="text-gray-600 mb-6 text-center">
              Uploading and preparing images for thermal comparison analysis.
            </p>
            
            <div className="w-full max-w-md">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">Upload Progress</span>
                <span className="text-sm text-gray-700 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-6">
                <div
                  className="bg-indigo-700 h-4 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <button
              className="bg-white text-gray-600 px-6 py-2 rounded border border-gray-400 hover:bg-gray-100"
              onClick={handleCancelUpload}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comparison */}
      {showComparison && !uploading && (
        <div
          className="bg-white rounded-2xl shadow p-8 w-full flex flex-col gap-6 transition-all duration-300"
          style={{ minHeight: "500px" }}
        >
          {/* Render the shared ThermalAnalysis component so the Transformer > View flow matches the sidebar UI */}
          <div className="w-full">
            <ThermalAnalysis
              initialBaselineFile={baselineImageFile}
              initialCandidateFile={thermalImage}
              autoStart={true}
            />
          </div>

          {/* Notes removed from bottom per request - the ThermalAnalysis component already contains notes section */}
        </div>
      )}

      {/* 🔹 Error Ruleset Modal */}
      {showRuleset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[500px] p-6 relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => setShowRuleset(false)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Error Ruleset
            </h2>

            {/* Temperature Deference */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700">
                Temperature Deference
              </h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-600 w-2/3">
                  Temperature deference between baseline and maintence images.
                </p>
                <select
                  value={tempDiff}
                  onChange={(e) => setTempDiff(e.target.value)}
                  className="border rounded px-3 py-2 text-gray-700 bg-gray-50"
                >
                  {[...Array(9)].map((_, i) => (
                    <option key={i} value={`${(i + 1) * 10}%`}>
                      {(i + 1) * 10}%
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Rule 2</h3>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule2Enabled}
                    onChange={() => setRule2Enabled(!rule2Enabled)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                      rule2Enabled ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                        rule2Enabled ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">Rule Description</p>
            </div>

            {/* Rule 3 */}
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Rule 3</h3>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule3Enabled}
                    onChange={() => setRule3Enabled(!rule3Enabled)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                      rule3Enabled ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                        rule3Enabled ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">Rule Description</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
