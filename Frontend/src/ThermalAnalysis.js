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

// Error Ruleset Modal Component
const ErrorRulesetModal = ({ isOpen, onClose, ruleset, setRuleset }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Error Ruleset</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Temperature Difference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature Difference
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Temperature difference between baseline and maintenance images.
            </p>
            <select
              value={ruleset.tempDifference}
              onChange={(e) => setRuleset({ ...ruleset, tempDifference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
            </select>
          </div>

          {/* Rule 2 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Hotspot Pattern Detection
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleset.rule2}
                  onChange={(e) => setRuleset({ ...ruleset, rule2: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Detect localized high-temperature zones that indicate potential winding or bushing failures.</p>
          </div>

          {/* Rule 3 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Cooling System Anomaly
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleset.rule3}
                  onChange={(e) => setRuleset({ ...ruleset, rule3: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Identify abnormal temperature distribution caused by cooling fan or oil circulation issues.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
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
  const [showRulesetModal, setShowRulesetModal] = useState(false);
  const [ruleset, setRuleset] = useState({
    tempDifference: '10',
    rule2: false,
    rule3: false
  });
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  
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
    setCurrentNote('');
    setSavedNotes([]);
    if (baselineInputRef.current) baselineInputRef.current.value = '';
    if (candidateInputRef.current) candidateInputRef.current.value = '';
  };

  const handleConfirmNotes = () => {
    if (currentNote.trim()) {
      setSavedNotes([...savedNotes, currentNote.trim()]);
      setCurrentNote('');
    }
  };

  const handleCancelNotes = () => {
    setCurrentNote('');
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
              Thermal Image
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

              <button
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
                onClick={() => setShowRulesetModal(true)}
              >
                ⚙️ Error Ruleset
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

      {/* Error Ruleset Modal */}
      <ErrorRulesetModal 
        isOpen={showRulesetModal}
        onClose={() => setShowRulesetModal(false)}
        ruleset={ruleset}
        setRuleset={setRuleset}
      />

      {/* Results Section */}
      {results && (
        <AnalysisResults 
          results={results} 
          processingTime={results.processingTimeMs || 0} 
        />
      )}

      {/* Notes Section */}
      {(baselineFile || candidateFile || results) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Notes</h3>
          
          {/* Display Saved Notes */}
          {savedNotes.length > 0 && (
            <div className="space-y-3 mb-4">
              {savedNotes.map((note, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                >
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-800">Note {index + 1}:</span>{' '}
                    <span className="text-indigo-700">{note}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="Type here to add notes..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-700"
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleConfirmNotes}
              disabled={!currentNote.trim()}
              className={`px-8 py-2.5 rounded-lg transition-colors font-medium ${
                currentNote.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
            <button
              onClick={handleCancelNotes}
              className="px-8 py-2.5 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}