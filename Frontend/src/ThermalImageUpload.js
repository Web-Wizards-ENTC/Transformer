import React, { useRef, useState, useEffect } from "react";
import errorsData from "./errors.json"; // existing errors file
import notesData from "./notes.json"; // new notes file

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
  const [showRuleset, setShowRuleset] = useState(false); // 🔹 for popup

  const [rule2Enabled, setRule2Enabled] = useState(false);
  const [rule3Enabled, setRule3Enabled] = useState(false);
  const [tempDiff, setTempDiff] = useState("10%");

  const [imageStates, setImageStates] = useState({
    baseline: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
    current: { zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } },
  });

  const inputRef = useRef(null);
  const uploadInterval = useRef(null);

  // Notes
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    setBaselineImage("/Transformer-Base.jpg");
    const now = new Date();
    setBaselineDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
    setNotes(notesData);
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
  const Legend = () => {
    const minTemp = 20;
    const maxTemp = 300;
    const steps = 8;
    const stepValue = (maxTemp - minTemp) / steps;
    const labels = Array.from({ length: steps + 1 }, (_, i) => minTemp + i * stepValue);

    return (
      <div className="flex flex-row items-center ml-2">
        <div
          className="w-4 h-72 rounded"
          style={{
            background: "linear-gradient(to top, blue, cyan, green, yellow, orange, red)",
            border: "1px solid #555",
          }}
        />
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
      {/* Upload */}
      {!uploading && !showComparison && (
        <div
          className="bg-white rounded-2xl shadow p-8 w-1/2 min-w-[400px] flex flex-col gap-6 transition-all duration-300"
          style={{ alignItems: "flex-start", minHeight: "500px" }}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <h3 className="text-xl font-bold text-gray-800">Thermal Image</h3>
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
            Upload a thermal image of the transformer to identify potential issues.
          </p>
          <label className="text-base font-semibold text-gray-800 mb-2 block">
            Weather Condition
          </label>
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

      {/* Uploading */}
      {uploading && (
        <div
          className="bg-white rounded-2xl shadow p-8 w-1/2 min-w-[400px] flex flex-col gap-6 transition-all duration-300"
          style={{ alignItems: "flex-start", minHeight: "500px" }}
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Thermal image uploading.</h3>
            <p className="text-gray-600 mb-4">
              Thermal image is being uploaded and reviewed.
            </p>
          </div>
          <div className="mb-2 flex justify-end w-full">
            <span className="text-sm text-gray-700 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
            <div
              className="bg-indigo-700 h-4 transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button
            className="bg-white text-gray-600 px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 w-auto"
            onClick={handleCancelUpload}
          >
            Cancel
          </button>
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

                      {/* Error boxes */}
                      {errorsData.map((err, index) => {
                        const [x, y] = err.position;
                        const { zoom, offset } = imageStates["current"];
                        const baseBoxSize = err.anomalySize * 25;
                        const boxSize = baseBoxSize * zoom;

                        const severityColors = {
                          1: "#3B82F6",
                          2: "#60A5FA",
                          3: "#FACC15",
                          4: "#F97316",
                          5: "#DC2626",
                        };
                        const color = severityColors[err.SeverityScore] || "#6B7280";

                        const left = x * zoom + offset.x - boxSize / 2;
                        const top = y * zoom + offset.y - boxSize / 2;

                        return (
                          <div
                            key={err.id}
                            className="absolute"
                            style={{
                              width: boxSize,
                              height: boxSize,
                              left,
                              top,
                              border: `2px solid ${color}`,
                              boxSizing: "border-box",
                            }}
                          >
                            <div
                              className="absolute flex items-center justify-center rounded-full text-white font-bold text-xs"
                              style={{
                                width: 6 * zoom,
                                height: 6 * zoom,
                                top: -3 * zoom,
                                left: -3 * zoom,
                                backgroundColor: color,
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
                🔄 Reset
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

              {/* 🔹 New Error Ruleset Button */}
              <button
                className="flex items-center gap-2 px-3 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 w-full"
                onClick={() => setShowRuleset(true)}
              >
                ⚙ Error Ruleset
              </button>
            </div>
          </div>

          {/* Errors */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Errors</h3>
            <div className="flex flex-col gap-3">
              {errorsData.map((err) => (
                <div
                  key={err.id}
                  className="bg-gray-200 p-3 rounded flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 text-white px-2 py-1 rounded font-bold">
                      {err.id}
                    </div>
                    <div className="flex flex-col text-sm text-gray-700">
                      <span>{err.dateTime}</span>
                      <span>{err.name}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {errorTypeMapping[err.type]}
                  </div>
                </div>
              ))}
            </div>
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
