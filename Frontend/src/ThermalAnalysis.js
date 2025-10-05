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
      
      {/* No Anomalies Detected - Normal Status */}
      {results.success && (!results.boxInfo || results.boxInfo.length === 0) && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center justify-center rounded-full text-white font-bold"
              style={{ 
                backgroundColor: '#10B981',
                width: '48px',
                height: '48px'
              }}
            >
              ✓
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">Normal</p>
              <p className="text-green-700 mt-1">No thermal anomalies detected. Transformer is operating normally.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-8 ml-16">
            <div>
              <p className="text-sm text-green-600">Status</p>
              <p className="text-lg font-semibold text-green-800">Normal Operation</p>
            </div>
            <div>
              <p className="text-sm text-green-600">Detected</p>
              <p className="text-lg font-semibold text-green-800">
                {new Date().toLocaleDateString('en-GB')} 
                {' '}
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Detected Anomalies */}
      {results.boxInfo && results.boxInfo.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-800">Detected Anomalies</h4>
            
          </div>
          <div className="space-y-2">
            {results.boxInfo.map((box, index) => {
              // Calculate confidence for this specific anomaly (using area fraction as a proxy)
              const anomalyConfidence = box.areaFrac > 0.05 ? 0.75 : box.areaFrac > 0.02 ? 0.65 : 0.55;
              const confidencePercent = Math.round(anomalyConfidence * 100);
              
              // Determine severity based on area coverage
              const severity = box.areaFrac > 0.05 ? 'HIGH' : box.areaFrac > 0.02 ? 'MEDIUM' : 'LOW';
              
              // Color scheme based on severity - used for both badge and bounding box
              const boxColor = severity === 'HIGH' ? '#DC2626' :    // Red for high
                              severity === 'MEDIUM' ? '#F97316' :   // Orange for medium
                              '#FACC15';                            // Yellow for low
              
              const severityColor = severity === 'HIGH' ? 'text-red-600 bg-red-100' :
                                   severity === 'MEDIUM' ? 'text-orange-600 bg-orange-100' :
                                   'text-yellow-600 bg-yellow-100';
              
              return (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="flex items-center justify-center rounded-full text-white font-bold text-sm"
                        style={{ 
                          backgroundColor: boxColor,
                          width: '28px',
                          height: '28px',
                          minWidth: '28px'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{box.label || box.boxFault}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8 ml-10">
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="text-lg font-semibold text-gray-800">{confidencePercent}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Severity</p>
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${severityColor}`}>
                        {severity}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coverage</p>
                      <p className="text-lg font-semibold text-gray-800">{(box.areaFrac * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Detected</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date().toLocaleDateString('en-GB')} 
                        {' '}
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
const ThermalImageDisplay = ({ imageUrl, title, boxes = [], boxInfo = [], imageWidth, imageHeight, tool, onZoomChange, onResetView, className = "" }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Expose zoom and reset to parent
  React.useEffect(() => {
    if (onZoomChange) {
      onZoomChange({ zoom, setZoom, offset, setOffset });
    }
  }, [zoom, offset, onZoomChange]);

  React.useEffect(() => {
    if (onResetView) {
      onResetView(() => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      });
    }
  }, [onResetView]);

  const getFaultColor = (index, boxInfo) => {
    // Determine severity based on area coverage from boxInfo
    if (boxInfo && boxInfo[index]) {
      const areaFrac = boxInfo[index].areaFrac;
      const severity = areaFrac > 0.05 ? 'HIGH' : areaFrac > 0.02 ? 'MEDIUM' : 'LOW';
      
      // Return color based on severity
      return severity === 'HIGH' ? '#DC2626' :    // Red for high
             severity === 'MEDIUM' ? '#F97316' :  // Orange for medium
             '#FACC15';                            // Yellow for low
    }
    
    // Fallback to cycling colors if boxInfo not available
    const colors = ['#DC2626', '#F97316', '#FACC15', '#10B981', '#3B82F6'];
    return colors[index % colors.length];
  };

  // Get actual displayed image size after load
  const handleImageLoad = () => {
    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      setDisplaySize({ 
        width: rect.width, 
        height: rect.height 
      });
    }
  };

  const handleImageClick = (e) => {
    if (tool !== 'zoom') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const newZoom = zoom >= 3 ? 1 : zoom + 0.5;
    const scale = newZoom / zoom;
    const newOffset = {
      x: offset.x - x * (scale - 1),
      y: offset.y - y * (scale - 1),
    };
    setZoom(newZoom);
    setOffset(newOffset);
  };

  const handleMouseDown = (e) => {
    if (tool !== 'drag') return;
    setDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging || tool !== 'drag') return;
    setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Calculate scale factors from ML image dimensions to displayed dimensions
  const scaleX = imageWidth && displaySize.width ? displaySize.width / imageWidth : 0;
  const scaleY = imageHeight && displaySize.height ? displaySize.height / imageHeight : 0;

  return (
    <div className={`relative ${className}`}>
      <h4 className="text-lg font-semibold mb-2 text-gray-800">{title}</h4>
      <div 
        ref={containerRef}
        className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
        onClick={handleImageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: tool === 'drag' ? 'grab' : tool === 'zoom' ? 'zoom-in' : 'default' }}
      >
        <div 
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: dragging ? 'none' : 'transform 0.2s ease',
            position: 'relative',
            display: 'inline-block'
          }}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-80 object-contain"
            onLoad={handleImageLoad}
            style={{ display: 'block' }}
          />
          
          {/* Bounding boxes overlay - positioned relative to image */}
          {boxes && boxes.length > 0 && scaleX > 0 && scaleY > 0 && boxes.map((box, index) => {
            const [x, y, w, h] = box;
            
            // Convert ML coordinates to displayed image coordinates
            const boxLeft = x * scaleX;
            const boxTop = y * scaleY;
            const boxWidth = w * scaleX;
            const boxHeight = h * scaleY;
            
            const color = getFaultColor(index, boxInfo);
            
            const boxStyle = {
              position: 'absolute',
              left: `${boxLeft}px`,
              top: `${boxTop}px`,
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              border: `2px solid ${color}`,
              backgroundColor: `${color}20`,
              pointerEvents: 'none',
              boxSizing: 'border-box'
            };

            return (
              <div key={index} style={boxStyle}>
                <div 
                  className="absolute -top-6 -left-1 bg-white px-2 py-1 rounded text-xs font-bold shadow"
                  style={{ color: color }}
                >
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
  const [tool, setTool] = useState(null);
  const [baselineImageControls, setBaselineImageControls] = useState(null);
  const [candidateImageControls, setCandidateImageControls] = useState(null);
  const [resetFunctions, setResetFunctions] = useState({ baseline: null, candidate: null });
  
  const baselineInputRef = useRef(null);
  const candidateInputRef = useRef(null);

  const handleZoomIn = () => {
    if (baselineImageControls) {
      const newZoom = Math.min(baselineImageControls.zoom + 0.5, 3);
      baselineImageControls.setZoom(newZoom);
    }
    if (candidateImageControls) {
      const newZoom = Math.min(candidateImageControls.zoom + 0.5, 3);
      candidateImageControls.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (baselineImageControls) {
      const newZoom = Math.max(baselineImageControls.zoom - 0.5, 1);
      baselineImageControls.setZoom(newZoom);
    }
    if (candidateImageControls) {
      const newZoom = Math.max(candidateImageControls.zoom - 0.5, 1);
      candidateImageControls.setZoom(newZoom);
    }
  };

  const handleResetView = () => {
    if (resetFunctions.baseline) {
      resetFunctions.baseline();
    }
    if (resetFunctions.candidate) {
      resetFunctions.candidate();
    }
    setTool(null);
  };

  const handleAnalyze = async () => {
    if (!baselineFile || !candidateFile) {
      setError('Please select both baseline and thermal images');
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

  const handleStartOver = () => {
    setBaselineFile(null);
    setCandidateFile(null);
    setResults(null);
    setError(null);
    setTool(null);
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
              Theramal Image
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
                    {candidateFile ? candidateFile.name : 'Click to upload thermal image'}
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
            onClick={handleStartOver}
            className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Start Over
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
          <div className="flex flex-row gap-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {baselineFile && (
                <ThermalImageDisplay
                  imageUrl={URL.createObjectURL(baselineFile)}
                  title="Baseline Image"
                  tool={tool}
                  onZoomChange={setBaselineImageControls}
                  onResetView={(resetFn) => setResetFunctions(prev => ({ ...prev, baseline: resetFn }))}
                />
              )}
              {candidateFile && (
                <ThermalImageDisplay
                  imageUrl={URL.createObjectURL(candidateFile)}
                  title="Thermal Image"
                  boxes={results?.boxes}
                  boxInfo={results?.boxInfo}
                  imageWidth={results?.imageWidth}
                  imageHeight={results?.imageHeight}
                  tool={tool}
                  onZoomChange={setCandidateImageControls}
                  onResetView={(resetFn) => setResetFunctions(prev => ({ ...prev, candidate: resetFn }))}
                />
              )}
            </div>
            
            {/* Annotation Tools */}
            <div className="w-48 flex flex-col gap-4 items-start border-l pl-4">
              <h4 className="text-base font-semibold text-gray-700">
                Annotation Tools
              </h4>
              
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded w-full ${
                  tool === 'drag'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setTool('drag')}
              >
                ✋ Drag
              </button>
              
              <div className="w-full">
                <p className="text-xs text-gray-600 mb-1 font-medium">Zoom Controls</p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    onClick={handleZoomIn}
                  >
                    🔍 +
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    onClick={handleZoomOut}
                  >
                    🔍 −
                  </button>
                </div>
              </div>
              
              <button
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 w-full"
                onClick={handleResetView}
              >
                � Reset View
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