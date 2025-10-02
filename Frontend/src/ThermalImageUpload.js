import React, { useRef, useState, useEffect } from "react";
import errorsData from "./errors.json"; // import the JSON file

export default function ThermalImageUpload({ inspection }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [weather, setWeather] = useState("Sunny");
  const [thermalImage, setThermalImage] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [baselineImage, setBaselineImage] = useState(null);
  const [baselineDateTime, setBaselineDateTime] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");

  const [tool, setTool] = useState(null);

  const [imageStates, setImageStates] = useState({
    baseline: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
    current: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
  });

  const inputRef = useRef(null);
  const uploadInterval = useRef(null);

  useEffect(() => {
    setBaselineImage("/Transformer-Base.jpg");
    const now = new Date();
    setBaselineDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setThermalImage(file);

    uploadInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval.current);
          setUploading(false);
          setShowComparison(true);
          const now = new Date();
          setCurrentDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleCancelUpload = () => {
    clearInterval(uploadInterval.current);
    setUploading(false);
    setProgress(0);
    setThermalImage(null);
    setCurrentDateTime("");
  };

  const handleReset = () => {
    setImageStates({
      baseline: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
      current: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
    });
    setTool(null);
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

  const errorTypeMapping = {
    1: "Loose Joint",
    2: "Loose Joint",
    3: "Point Overload",
    4: "Point Overload",
    5: "Full Wire Overload",
    6: "Unknown",
  };

  // Render error squares only for "current" image
  const renderErrorSquares = (key) => {
    if (key !== "current") return null; // only show on current
    const { zoom, offset } = imageStates[key];
    return errorsData.map((err, index) => {
      const x = err.position[0] * zoom + offset.x;
      const y = err.position[1] * zoom + offset.y;
      return (
        <div
          key={`${key}-error-${index}`}
          className="absolute border-2 border-red-500 w-6 h-6"
          style={{ top: y, left: x }}
        >
          <div className="absolute -top-3 -left-3 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {index + 1}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {/* Upload Form */}
      {!uploading && !showComparison && (
        <div className="bg-white rounded-2xl shadow p-8 w-1/2 min-w-[400px] flex flex-col gap-6 transition-all duration-300"
             style={{ alignItems: "flex-start", minHeight: "500px" }}>
          <div className="flex items-center justify-between w-full mb-2">
            <h3 className="text-xl font-bold text-gray-800">Thermal Image</h3>
            <span
              className={`px-3 py-1 rounded text-xs font-semibold ${
                inspection?.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
              }`}
            >
              {inspection?.status === "Pending" ? "Pending" : "In progress"}
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            Upload a thermal image of the transformer to identify potential issues.
          </p>
          <label className="text-base font-semibold text-gray-800 mb-2 block">Weather Condition</label>
          <select
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="border rounded px-4 py-2 mb-6 w-full text-gray-700 bg-gray-50"
          >
            <option value="Sunny">Sunny</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Rainy">Rainy</option>
          </select>
          <button
            className="w-full bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold text-base hover:bg-indigo-800 transition"
            onClick={() => inputRef.current.click()}
          >
            Upload thermal Image
          </button>
          <input type="file" ref={inputRef} className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="bg-white rounded-2xl shadow p-8 w-1/2 min-w-[400px] flex flex-col gap-6 transition-all duration-300"
             style={{ alignItems: "flex-start", minHeight: "500px" }}>
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
          <button
            className="bg-white text-gray-600 px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 w-auto"
            onClick={handleCancelUpload}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Comparison State */}
      {showComparison && !uploading && (
        <div className="bg-white rounded-2xl shadow p-8 w-full flex flex-col gap-6 transition-all duration-300"
             style={{ minHeight: "500px" }}>
          {/* Images */}
          <div className="flex flex-row gap-6 relative">
            <div className="flex-1 flex flex-col gap-6 relative">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Thermal Image Comparison</h3>
              <div className="grid grid-cols-2 gap-8 w-full">
                {/* Baseline */}
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className="relative w-full max-w-md h-72 flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg"
                    onClick={(e) => handleImageClick(e, "baseline")}
                    onMouseDown={(e) => handleMouseDown(e, "baseline")}
                    onMouseMove={(e) => handleMouseMove(e, "baseline")}
                    onMouseUp={() => handleMouseUp("baseline")}
                    onMouseLeave={() => handleMouseUp("baseline")}
                  >
                    <img src={baselineImage} alt="Baseline" className="w-full h-72 object-cover" style={getImageStyle("baseline")} />
                    <span className="absolute top-0 left-0 mt-4 ml-4 bg-indigo-700 text-white text-sm px-3 py-1 rounded shadow">Baseline</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{baselineDateTime}</span>
                </div>

                {/* Current */}
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className="relative w-full max-w-md h-72 flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg"
                    onClick={(e) => handleImageClick(e, "current")}
                    onMouseDown={(e) => handleMouseDown(e, "current")}
                    onMouseMove={(e) => handleMouseMove(e, "current")}
                    onMouseUp={() => handleMouseUp("current")}
                    onMouseLeave={() => handleMouseUp("current")}
                  >
                    <img
                      src={thermalImage ? URL.createObjectURL(thermalImage) : "/Transformer-Current.jpg"}
                      alt="Current"
                      className="w-full h-72 object-cover"
                      style={getImageStyle("current")}
                    />
                    {renderErrorSquares("current")}
                    <span className="absolute top-0 left-0 mt-4 ml-4 bg-indigo-700 text-white text-sm px-3 py-1 rounded shadow">Current</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{currentDateTime}</span>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="w-40 flex flex-col gap-4 items-start border-l pl-4">
              <h4 className="text-base font-semibold text-gray-700">Annotation Tools</h4>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 w-full" onClick={handleReset}>🔄 Reset</button>
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded w-full ${tool === "drag" ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => setTool("drag")}
              >
                ✋ Drag
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded w-full ${tool === "zoom" ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => setTool("zoom")}
              >
                🔍 Zoom
              </button>
            </div>
          </div>

          {/* Errors Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Errors</h3>
            <div className="flex flex-col gap-3">
              {errorsData.map((err, index) => (
                <div key={err.id} className="bg-gray-200 p-3 rounded flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 text-white px-2 py-1 rounded font-bold">{err.id}</div>
                    <div className="flex flex-col text-sm text-gray-700">
                      <span>{err.dateTime}</span>
                      <span>{err.name}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{errorTypeMapping[err.type]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
