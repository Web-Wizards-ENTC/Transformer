import React, { useRef, useState, useEffect } from "react";
import { analyzeThermalImagesUpload, uploadTransformerCurrent, uploadTransformerBase } from "./API";
import notesData from "./notes.json"; // notes file

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

  // Notes
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    // Remove default baseline image setup since user will upload it
    const now = new Date();
    setBaselineDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
    setNotes(notesData);
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
        if (prev >= 100) {
          clearInterval(uploadInterval.current);
          setUploading(false);
          setShowComparison(true);
          
          // Start ML analysis after showing comparison
          performThermalAnalysis();
          return 100;
        }
        return prev + 3;
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
  const handleConfirmNote = () => {
    if (!newNote.trim()) return;
    const nextId = notes.length > 0 ? notes[notes.length - 1].id + 1 : 1;
    const updatedNotes = [...notes, { id: nextId, text: newNote }];
    setNotes(updatedNotes);
    setNewNote("");
    setShowPlaceholder(true);
  };

  const handleCancelNote = () => {
    setNewNote("");
    setShowPlaceholder(true);
  };

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
          <div className="flex flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Thermal Image Comparison
              </h3>
              <div className="grid grid-cols-2 gap-8 w-full">
                {/* Baseline */}
                <div className="relative w-full flex flex-col items-center">
                  <div className="flex items-center">
                    <div
                      className="relative w-full max-w-md h-72 flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg"
                      onClick={(e) => handleImageClick(e, "baseline")}
                      onMouseDown={(e) => handleMouseDown(e, "baseline")}
                      onMouseMove={(e) => handleMouseMove(e, "baseline")}
                      onMouseUp={() => handleMouseUp("baseline")}
                      onMouseLeave={() => handleMouseUp("baseline")}
                    >
                      <img
                        src={baselineImage}
                        alt="Baseline"
                        className="w-full h-72 object-cover"
                        style={getImageStyle("baseline")}
                      />
                      <span className="absolute top-0 left-0 mt-4 ml-4 bg-indigo-700 text-white text-sm px-3 py-1 rounded shadow">
                        Baseline
                      </span>
                    </div>
                    <Legend />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {baselineDateTime}
                  </span>
                </div>

                {/* Current */}
                <div className="relative w-full flex flex-col items-center">
                  <div className="flex items-center">
                    <div
                      className="relative w-full max-w-md h-72 flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg"
                      onClick={(e) => handleImageClick(e, "current")}
                      onMouseDown={(e) => handleMouseDown(e, "current")}
                      onMouseMove={(e) => handleMouseMove(e, "current")}
                      onMouseUp={() => handleMouseUp("current")}
                      onMouseLeave={() => handleMouseUp("current")}
                    >
                      <img
                        src={
                          thermalImage
                            ? URL.createObjectURL(thermalImage)
                            : "/Transformer-Current.jpg"
                        }
                        alt="Current"
                        className="w-full h-72 object-cover"
                        style={getImageStyle("current")}
                      />

                      {/* ML Analysis Result Boxes */}
                      {analysisResults?.boxes && analysisResults.boxes.map((box, index) => {
                        const [x, y, w, h] = box;
                        const { zoom, offset } = imageStates["current"];
                        const boxWidth = w * zoom;
                        const boxHeight = h * zoom;

                        // Get fault color based on box info
                        const boxInfo = analysisResults.boxInfo?.[index];
                        const getFaultColor = (faultType) => {
                          switch (faultType?.toLowerCase()) {
                            case 'loose joint': return "#DC2626";
                            case 'wire overload': return "#F97316";
                            case 'point overload': return "#FACC15";
                            default: return "#6B7280";
                          }
                        };
                        
                        const color = getFaultColor(boxInfo?.boxFault);
                        const left = x * zoom + offset.x;
                        const top = y * zoom + offset.y;

                        return (
                          <div
                            key={`ml-box-${index}`}
                            className="absolute"
                            style={{
                              width: boxWidth,
                              height: boxHeight,
                              left,
                              top,
                              border: `2px solid ${color}`,
                              backgroundColor: `${color}20`,
                              boxSizing: "border-box",
                            }}
                          >
                            <div
                              className="absolute flex items-center justify-center rounded-full text-white font-bold text-xs"
                              style={{
                                width: 20 * zoom,
                                height: 20 * zoom,
                                top: -10 * zoom,
                                left: -10 * zoom,
                                backgroundColor: color,
                                fontSize: Math.max(10, 12 * zoom),
                              }}
                            >
                              {index + 1}
                            </div>
                          </div>
                        );
                      })}

                      <span className="absolute top-0 left-0 mt-4 ml-4 bg-indigo-700 text-white text-sm px-3 py-1 rounded shadow">
                        Current
                      </span>
                    </div>
                    <Legend />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {currentDateTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="w-40 flex flex-col gap-4 items-start border-l pl-4">
              <h4 className="text-base font-semibold text-gray-700">
                Annotation Tools
              </h4>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 w-full"
                onClick={handleReset}
              >
                🔄 Reset View
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded w-full ${
                  tool === "drag"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setTool("drag")}
              >
                ✋ Drag
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded w-full ${
                  tool === "zoom"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setTool("zoom")}
              >
                🔍 Zoom
              </button>

              <button
                className="flex items-center gap-2 px-3 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 w-full"
                onClick={() => setShowRuleset(true)}
              >
                ⚙ Error Ruleset
              </button>

              <div className="border-t pt-4 mt-2 w-full">
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 w-full"
                  onClick={handleStartOver}
                >
                  🔄 Start Over
                </button>
              </div>
            </div>
          </div>

          {/* ML Analysis Results */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Thermal Analysis Results</h3>
            
            {analyzing && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="text-lg text-gray-600">Analyzing thermal images...</span>
                </div>
              </div>
            )}

            {/* Analysis Results Grid */}
            {analysisResults && !analyzing && (
              <div className="grid grid-cols-3 gap-8 mb-6">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Fault Type</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {analysisResults.faultType || 'None detected'}
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Confidence</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {Math.round((analysisResults.confidence || 0) * 100)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Processing Time</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {analysisResults.processingTimeMs || 0}ms
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Anomalies */}
            {analysisResults?.boxInfo && analysisResults.boxInfo.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Detected Anomalies:</h4>
                <div className="flex flex-col gap-3">
                  {analysisResults.boxInfo.map((box, index) => {
                    const getFaultColor = (faultType) => {
                      switch (faultType?.toLowerCase()) {
                        case 'loose joint': return "bg-red-500";
                        case 'wire overload': return "bg-orange-500";
                        case 'point overload': return "bg-yellow-500";
                        default: return "bg-gray-500";
                      }
                    };

                    return (
                      <div
                        key={index}
                        className="bg-gray-200 p-3 rounded flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${getFaultColor(box.boxFault)} text-white px-2 py-1 rounded font-bold`}>
                            {index + 1}
                          </div>
                          <div className="flex flex-col text-sm text-gray-700">
                            <span>{box.label || box.boxFault}</span>
                            <span>Position: ({box.x}, {box.y}) | Size: {box.w}×{box.h}</span>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                          Coverage: {(box.areaFrac * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No anomalies detected */}
            {analysisResults && analysisResults.success && (!analysisResults.boxInfo || analysisResults.boxInfo.length === 0) && !analyzing && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">No thermal anomalies detected</p>
                <p className="text-green-600 text-sm">The thermal analysis shows normal operating conditions.</p>
              </div>
            )}

            {/* Analysis Error */}
            {analysisError && !analyzing && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-800 font-medium">Analysis Error</p>
                <p className="text-red-600 text-sm">{analysisError}</p>
              </div>
            )}

            {/* Analysis not started */}
            {!analyzing && !analysisResults && !analysisError && showComparison && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">Thermal analysis in progress</p>
                <p className="text-blue-600 text-sm">The ML model is analyzing the uploaded thermal image for anomalies.</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {notes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Notes</h3>
              <div className="flex flex-col gap-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gray-100 p-3 rounded text-gray-700 text-sm"
                  >
                    <span className="font-semibold mr-2">Note {note.id}:</span>
                    {note.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Note Box */}
          <div className="mt-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onFocus={() => setShowPlaceholder(false)}
              onBlur={() => !newNote && setShowPlaceholder(true)}
              placeholder={showPlaceholder ? "Type here to add notes..." : ""}
              className="w-full border rounded p-3 text-sm text-gray-700 bg-gray-50 resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-3">
              <button
                className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-800"
                onClick={handleConfirmNote}
              >
                Confirm
              </button>
              <button
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200"
                onClick={handleCancelNote}
              >
                Cancel
              </button>
            </div>
          </div>
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
