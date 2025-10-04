import React, { useState, useRef } from 'react';
import { analyzeThermalImagesUpload, analyzeThermalImagesById, analyzeThermalImageWithBaseline } from './API';

// Component for displaying ML analysis results
const AnalysisResults = ({ results, processingTime }) => {
  if (!results) return null;

  const getFaultColor = (faultType) => {
    switch (faultType?.toLowerCase()) {
      case 'loose joint': return '#DC2626'; // Red
      case 'wire overload': return '#F97316'; // Orange  
      case 'point overload': return '#FACC15'; // Yellow
      default: return '#10B981'; // Green for normal
    }
  };

  const getSeverityLevel = (confidence) => {
    if (confidence >= 0.8) return 'HIGH';
    if (confidence >= 0.5) return 'MEDIUM';
    return 'LOW';
  };

  const getSeverityColor = (confidence) => {
    if (confidence >= 0.8) return 'text-red-600 bg-red-100';
    if (confidence >= 0.5) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Analysis Results</h3>
      
      {/* Overall Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Fault Type</p>
          <p className="text-lg font-semibold" style={{ color: getFaultColor(results.faultType) }}>
            {results.faultType || 'None'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Confidence</p>
          <p className="text-lg font-semibold text-gray-800">
            {Math.round((results.confidence || 0) * 100)}%
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Severity</p>
          <span className={`px-2 py-1 rounded text-sm font-semibold ${getSeverityColor(results.confidence || 0)}`}>
            {getSeverityLevel(results.confidence || 0)}
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Processing Time</p>
          <p className="text-lg font-semibold text-gray-800">{processingTime}ms</p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Histogram Distance</p>
          <p className="text-lg font-semibold text-blue-800">
            {results.histDistance?.toFixed(3) || 'N/A'}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Brightness Change (DV95)</p>
          <p className="text-lg font-semibold text-green-800">
            {results.dv95?.toFixed(3) || 'N/A'}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Warm Fraction</p>
          <p className="text-lg font-semibold text-purple-800">
            {((results.warmFraction || 0) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Detected Anomalies */}
      {results.boxInfo && results.boxInfo.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Detected Anomalies</h4>
          <div className="space-y-2">
            {results.boxInfo.map((box, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getFaultColor(box.boxFault) }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-800">{box.label || box.boxFault}</p>
                    <p className="text-sm text-gray-600">
                      Position: ({box.x}, {box.y}) | Size: {box.w}×{box.h}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Coverage</p>
                  <p className="font-semibold">{(box.areaFrac * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {!results.success && results.errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800 font-medium">Analysis Failed</p>
          <p className="text-red-600 text-sm">{results.errorMessage}</p>
        </div>
      )}
    </div>
  );
};

// Component for displaying thermal images with bounding boxes
const ThermalImageDisplay = ({ imageUrl, title, boxes = [], imageWidth, imageHeight, className = "" }) => {
  const [imageState, setImageState] = useState({
    zoom: 1,
    offset: { x: 0, y: 0 },
    dragging: false,
    startPos: { x: 0, y: 0 }
  });

  const getFaultColor = (index) => {
    const colors = ['#DC2626', '#F97316', '#FACC15', '#10B981', '#3B82F6'];
    return colors[index % colors.length];
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setImageState(prev => {
      const newZoom = prev.zoom >= 3 ? 1 : prev.zoom + 0.5;
      const scale = newZoom / prev.zoom;
      const newOffset = {
        x: prev.offset.x - x * (scale - 1),
        y: prev.offset.y - y * (scale - 1),
      };
      return { ...prev, zoom: newZoom, offset: newOffset };
    });
  };

  const handleMouseDown = (e) => {
    setImageState(prev => ({
      ...prev,
      dragging: true,
      startPos: { x: e.clientX - prev.offset.x, y: e.clientY - prev.offset.y }
    }));
  };

  const handleMouseMove = (e) => {
    setImageState(prev => {
      if (!prev.dragging) return prev;
      return {
        ...prev,
        offset: { x: e.clientX - prev.startPos.x, y: e.clientY - prev.startPos.y }
      };
    });
  };

  const handleMouseUp = () => {
    setImageState(prev => ({ ...prev, dragging: false }));
  };

  const getImageStyle = () => {
    const { zoom, offset, dragging } = imageState;
    return {
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
      transformOrigin: "center",
      transition: dragging ? "none" : "transform 0.2s ease",
      cursor: "pointer"
    };
  };

  return (
    <div className={`relative ${className}`}>
      <h4 className="text-lg font-semibold mb-2 text-gray-800">{title}</h4>
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          style={getImageStyle()}
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {/* Bounding boxes */}
        {boxes && boxes.map((box, index) => {
          const { zoom, offset } = imageState;
          const [x, y, w, h] = box;
          
          // Calculate box position and size based on zoom and offset
          const boxStyle = {
            position: 'absolute',
            left: `${x * zoom + offset.x}px`,
            top: `${y * zoom + offset.y}px`,
            width: `${w * zoom}px`,
            height: `${h * zoom}px`,
            border: `2px solid ${getFaultColor(index)}`,
            backgroundColor: `${getFaultColor(index)}20`,
            pointerEvents: 'none'
          };

          return (
            <div key={index} style={boxStyle}>
              <div 
                className="absolute -top-6 -left-1 bg-white px-2 py-1 rounded text-xs font-bold shadow"
                style={{ color: getFaultColor(index) }}
              >
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Reset button */}
      <button
        onClick={() => setImageState({ zoom: 1, offset: { x: 0, y: 0 }, dragging: false, startPos: { x: 0, y: 0 } })}
        className="absolute top-8 right-2 bg-white px-3 py-1 rounded shadow text-sm font-medium hover:bg-gray-50"
      >
        Reset View
      </button>
    </div>
  );
};

// Main Thermal Analysis Component
export default function ThermalAnalysis() {
  const [baselineFile, setBaselineFile] = useState(null);
  const [candidateFile, setCandidateFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const baselineInputRef = useRef(null);
  const candidateInputRef = useRef(null);

  const handleAnalyze = async () => {
    if (!baselineFile || !candidateFile) {
      setError('Please select both baseline and candidate images');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const analysisResults = await analyzeThermalImagesUpload(baselineFile, candidateFile);
      setResults(analysisResults);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setBaselineFile(null);
    setCandidateFile(null);
    setResults(null);
    setError(null);
    if (baselineInputRef.current) baselineInputRef.current.value = '';
    if (candidateInputRef.current) candidateInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Thermal Analysis</h2>
      
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Thermal Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Baseline Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={baselineInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setBaselineFile(e.target.files[0])}
                className="hidden"
                id="baseline-upload"
              />
              <label htmlFor="baseline-upload" className="cursor-pointer">
                <div className="text-gray-600">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm">
                    {baselineFile ? baselineFile.name : 'Click to upload baseline image'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Candidate Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={candidateInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setCandidateFile(e.target.files[0])}
                className="hidden"
                id="candidate-upload"
              />
              <label htmlFor="candidate-upload" className="cursor-pointer">
                <div className="text-gray-600">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm">
                    {candidateFile ? candidateFile.name : 'Click to upload candidate image'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={!baselineFile || !candidateFile || analyzing}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              !baselineFile || !candidateFile || analyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Images'}
          </button>
          
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Image Preview Section */}
      {(baselineFile || candidateFile) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Image Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {baselineFile && (
              <ThermalImageDisplay
                imageUrl={URL.createObjectURL(baselineFile)}
                title="Baseline Image"
              />
            )}
            {candidateFile && (
              <ThermalImageDisplay
                imageUrl={URL.createObjectURL(candidateFile)}
                title="Candidate Image"
                boxes={results?.boxes}
                imageWidth={results?.imageWidth}
                imageHeight={results?.imageHeight}
              />
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <AnalysisResults 
          results={results} 
          processingTime={results.processingTimeMs || 0} 
        />
      )}
    </div>
  );
}