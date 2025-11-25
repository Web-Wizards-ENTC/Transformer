import React, { useState, useRef } from 'react';
import { analyzeThermalImagesUpload, analyzeThermalImagesById, analyzeThermalImageWithBaseline } from './API';

// --- New Component: Add Anomaly Modal (for rule selection) ---

const ANOMALY_RULES = [
  'Loose Joint',
  'Wire Overload',
  'Point Overload',
  'Oil Leakage',
  'Bushing Failure',
  'Other Hotspot'
];

const AddAnomalyModal = ({ isOpen, onClose, onConfirm }) => {
  const [selectedRule, setSelectedRule] = useState(ANOMALY_RULES[0]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Add Anomaly Rule</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Anomaly Rule
          </label>
          <select
            value={selectedRule}
            onChange={(e) => setSelectedRule(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ANOMALY_RULES.map(rule => (
              <option key={rule} value={rule}>{rule}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Existing Component: AnalysisResults (Modified) ---

// Component for displaying ML analysis results
const AnalysisResults = ({ results, processingTime }) => {
  if (!results) return null;

  const getFaultColor = (faultType) => {
    switch (faultType?.toLowerCase()) {
      case 'loose joint': return '#DC2626'; // Red
      case 'wire overload': return '#F97316'; // Orange
      case 'point overload': return '#FACC15'; // Yellow
      case 'oil leakage': return '#3B82F6'; // Blue
      case 'bushing failure': return '#8B5CF6'; // Violet
      case 'other hotspot': return '#10B981'; // Green
      default: return '#10B981'; // Green for normal/default
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
              const isDeleted = box.deleted;
              const isManual = box.isManual;
              
              const itemBgClass = isDeleted ? 'bg-gray-100' : isManual ? 'bg-yellow-50 border-yellow-300 border' : 'bg-gray-50';
              const textClass = isDeleted ? 'text-gray-500' : 'text-gray-800';
              const labelClass = isDeleted ? 'text-gray-500' : 'font-medium text-gray-800';
              const fontClass = isDeleted ? 'font-normal' : 'font-semibold';
              const subTextClass = isDeleted ? 'text-gray-400' : 'text-gray-600';
              
              // Only calculate confidence/severity for AI-detected boxes
              const anomalyConfidence = !isManual ? (box.areaFrac > 0.05 ? 0.75 : box.areaFrac > 0.02 ? 0.65 : 0.55) : null;
              const confidencePercent = anomalyConfidence ? Math.round(anomalyConfidence * 100) : null;
              
              const severity = !isManual ? (box.areaFrac > 0.05 ? 'HIGH' : box.areaFrac > 0.02 ? 'MEDIUM' : 'LOW') : null;
              
              const boxColor = isDeleted ? '#6B7280' : 
                               (severity === 'HIGH' ? '#DC2626' : 
                               severity === 'MEDIUM' ? '#F97316' : 
                               severity === 'LOW' ? '#FACC15' : 
                               getFaultColor(box.label || box.boxFault)); 
              
              const severityColor = isDeleted ? 'text-gray-500 bg-gray-200' : 
                                    (severity === 'HIGH' ? 'text-red-600 bg-red-100' :
                                    severity === 'MEDIUM' ? 'text-orange-600 bg-orange-100' :
                                    severity === 'LOW' ? 'text-yellow-600 bg-yellow-100' :
                                    'text-blue-600 bg-blue-100'); 

              return (
                <div key={index} className={`${itemBgClass} p-3 rounded-lg`}>
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
                        <p className={labelClass}>
                          {box.label || box.boxFault} 
                          {isManual && (
                            <span className="ml-2 text-xs font-bold text-yellow-700">
                              (Manual by {box.createdBy ?? 'Manual User'})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-8 ml-10 ${isDeleted ? 'opacity-50' : ''}`}>
                    
                    {/* Only show Confidence and Severity for AI boxes */}
                    {!isManual && (
                      <>
                        <div>
                          <p className={`text-sm ${subTextClass}`}>Confidence</p>
                          <p className={`text-lg ${fontClass} ${textClass}`}>{confidencePercent}%</p>
                        </div>
                        <div>
                          <p className={`text-sm ${subTextClass}`}>Severity</p>
                          <span className={`px-2 py-1 rounded text-sm ${fontClass} ${severityColor}`}>
                            {severity}
                          </span>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <p className={`text-sm ${subTextClass}`}>Coverage</p>
                      <p className={`text-lg ${fontClass} ${textClass}`}>{(box.areaFrac * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className={`text-sm ${subTextClass}`}>Detected</p>
                      <p className={`text-lg ${fontClass} ${textClass}`}>
                        {new Date().toLocaleDateString('en-GB')} 
                        {' '}
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {isManual && box.createdBy && (
                      <div>
                        <p className={`text-sm ${subTextClass}`}>Created By</p>
                        <p className={`text-lg ${fontClass} ${textClass}`}>{box.createdBy}</p>
                      </div>
                    )}
                  </div>

                  {/* Deletion Log */}
                  {isDeleted && (
                    <div className="mt-4 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold">Deletion Log</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Deleted by: <span className="font-medium">{box.deletedBy}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Date: <span className="font-medium">{new Date(box.deletedAt).toLocaleString('en-GB')}</span>
                      </p>
                    </div>
                  )}
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


// --- Existing Component: ThermalImageDisplay (Modified for Adjust Marker) ---

// Component for displaying thermal images with bounding boxes
const ThermalImageDisplay = ({ 
  imageUrl, 
  title, 
  boxes = [], 
  boxInfo = [], 
  imageWidth, 
  imageHeight, 
  tool, 
  onZoomChange, 
  onResetView, 
  onDeleteBox, 
  className = "",
  isCandidateImage = false, 
  onDrawAnomaly,
  drawingAnomaly,
  // NEW PROPS
  currentAdjustment,
  setCurrentAdjustment,
  setResults 
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Drawing state for manual anomaly
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);

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
    if (boxInfo && boxInfo[index]) {
      const box = boxInfo[index];
      if (box.isManual) {
        switch (box.label?.toLowerCase()) {
          case 'loose joint': return '#DC2626'; 
          case 'wire overload': return '#F97316'; 
          case 'point overload': return '#FACC15'; 
          case 'oil leakage': return '#3B82F6'; 
          case 'bushing failure': return '#8B5CF6'; 
          case 'other hotspot': return '#10B981'; 
          default: return '#10B981';
        }
      }
      
      const areaFrac = box.areaFrac;
      const severity = areaFrac > 0.05 ? 'HIGH' : areaFrac > 0.02 ? 'MEDIUM' : 'LOW';
      
      return severity === 'HIGH' ? '#DC2626' :
             severity === 'MEDIUM' ? '#F97316' :
             '#FACC15';
    }
    
    const colors = ['#DC2626', '#F97316', '#FACC15', '#10B981', '#3B82F6'];
    return colors[index % colors.length];
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      setDisplaySize({ 
        width: rect.width, 
        height: rect.height 
      });
    }
  };

  const scaleX = imageWidth && displaySize.width ? displaySize.width / imageWidth : 0;
  const scaleY = imageHeight && displaySize.height ? displaySize.height / imageHeight : 0;
  
  const getScaledCoords = (clientX, clientY) => {
    if (!imgRef.current) return { originalX: 0, originalY: 0 };
    
    const imageRect = imgRef.current.getBoundingClientRect();

    const xOnScreen = (clientX - imageRect.left) / zoom;
    const yOnScreen = (clientY - imageRect.top) / zoom;

    const originalX = xOnScreen / scaleX;
    const originalY = yOnScreen / scaleY;

    const clampedX = Math.max(0, Math.min(originalX, imageWidth));
    const clampedY = Math.max(0, Math.min(originalY, imageHeight));

    return { originalX: clampedX, originalY: clampedY };
  };

  const updateBoxState = (index, newCoords) => {
    setResults(prevResults => {
      if (!prevResults || !prevResults.boxes) return prevResults;

      const newBoxes = [...prevResults.boxes];
      const newBoxInfo = [...prevResults.boxInfo];
      
      const [x, y, w, h] = newCoords;
      const imageAreaProxy = (prevResults.imageWidth || 1000) * (prevResults.imageHeight || 1000);
      const boxArea = w * h;
      const areaFrac = boxArea / imageAreaProxy;

      newBoxes[index] = { ...newBoxes[index], coords: newCoords };
      
      if (newBoxInfo[index]) {
          newBoxInfo[index] = { ...newBoxInfo[index], areaFrac: areaFrac };
      }

      return { ...prevResults, boxes: newBoxes, boxInfo: newBoxInfo };
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;

    const targetClass = e.target.className;
    
    // Stop image pan/zoom/draw if interaction is on a handle/box-content during adjustment
    if (isCandidateImage && tool === 'adjust' && (targetClass.includes('box-handle') || targetClass.includes('box-content'))) {
        e.stopPropagation();
    }

    if (tool === 'drag') {
      setDragging(true);
      setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    } else if (isCandidateImage && tool === 'drawAnomaly' && !drawing) {
      setDrawing(true);
      const { originalX, originalY } = getScaledCoords(e.clientX, e.clientY);
      setStartPoint({ x: originalX, y: originalY });
      setCurrentRect({ start: { x: originalX, y: originalY }, end: { x: originalX, y: originalY } });
    } else if (isCandidateImage && tool === 'adjust' && targetClass.includes('box-handle')) {
        const index = parseInt(e.target.dataset.index);
        const handle = e.target.dataset.handle;
        const [x, y, w, h] = boxes[index].coords;
        
        setCurrentAdjustment({
            index: index,
            mode: 'resize',
            handle: handle,
            initialBox: { x, y, w, h },
            startClientX: e.clientX,
            startClientY: e.clientY,
        });
    } else if (isCandidateImage && tool === 'adjust' && targetClass.includes('box-content')) {
        const index = parseInt(e.target.dataset.index);
        const [x, y, w, h] = boxes[index].coords;
        
        setCurrentAdjustment({
            index: index,
            mode: 'drag',
            handle: null,
            initialBox: { x, y, w, h },
            startClientX: e.clientX,
            startClientY: e.clientY,
        });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging && tool === 'drag') {
      setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
      return;
    } 
    
    if (drawing && isCandidateImage && tool === 'drawAnomaly') {
      const { originalX, originalY } = getScaledCoords(e.clientX, e.clientY);
      setCurrentRect(prev => ({ ...prev, end: { x: originalX, y: originalY } }));
      return;
    }

    if (currentAdjustment && isCandidateImage) {
        const { index, mode, handle, initialBox, startClientX, startClientY } = currentAdjustment;

        const deltaX = (e.clientX - startClientX) / zoom / scaleX;
        const deltaY = (e.clientY - startClientY) / zoom / scaleY;

        let { x, y, w, h } = initialBox;
        let newX = x, newY = y, newW = w, newH = h;
        
        if (mode === 'drag') {
            newX = x + deltaX;
            newY = y + deltaY;
        } else if (mode === 'resize') {
            switch (handle) {
                case 'n': newY = y + deltaY; newH = h - deltaY; break;
                case 's': newH = h + deltaY; break;
                case 'w': newX = x + deltaX; newW = w - deltaX; break;
                case 'e': newW = w + deltaX; break;
                case 'nw': newX = x + deltaX; newW = w - deltaX; newY = y + deltaY; newH = h - deltaY; break;
                case 'ne': newW = w + deltaX; newY = y + deltaY; newH = h - deltaY; break;
                case 'sw': newX = x + deltaX; newW = w - deltaX; newH = h + deltaY; break;
                case 'se': newW = w + deltaX; newH = h + deltaY; break;
            }
        }
        
        // Ensure width/height don't go negative and positions stay logical
        newW = Math.max(5, newW);
        newH = Math.max(5, newH);
        
        // Adjust position if resizing flipped the box
        if (mode === 'resize') {
            if (newW < 5 && newX !== x) newX = x + w;
            if (newH < 5 && newY !== y) newY = y + h;
        }

        // Update the box visually immediately
        setResults(prevResults => {
            const tempBoxes = [...prevResults.boxes];
            tempBoxes[index] = { ...tempBoxes[index], coords: [newX, newY, newW, newH] };
            return { ...prevResults, boxes: tempBoxes };
        });
    }
  };

  const handleMouseUp = (e) => {
    if (dragging) {
      setDragging(false);
    } else if (drawing && isCandidateImage && tool === 'drawAnomaly') {
      setDrawing(false);
      
      if (!currentRect) return;

      const x1 = currentRect.start.x;
      const y1 = currentRect.start.y;
      const x2 = currentRect.end.x;
      const y2 = currentRect.end.y;

      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const width = Math.abs(x1 - x2);
      const height = Math.abs(y1 - y2);

      if (width > 5 && height > 5) { 
        const newBoxCoords = [minX, minY, width, height];
        onDrawAnomaly(newBoxCoords);
      }
      
      setStartPoint(null);
      setCurrentRect(null);
    } else if (currentAdjustment) {
        const { index } = currentAdjustment;
        const finalCoords = boxes[index].coords;
        updateBoxState(index, finalCoords);
        setCurrentAdjustment(null);
    }
  };
  
  const handleImageClick = (e) => {
    if (tool === 'zoom' && !drawing && !dragging && !currentAdjustment) {
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
    }
  };

  let cursorStyle = 'default';
  if (tool === 'drag' || dragging) {
    cursorStyle = 'grab';
  } else if (tool === 'zoom') {
    cursorStyle = 'zoom-in';
  } else if (isCandidateImage && tool === 'drawAnomaly') {
    cursorStyle = 'crosshair'; 
  } else if (isCandidateImage && tool === 'adjust') {
    cursorStyle = 'move'; 
  }
  
  if (currentAdjustment?.mode === 'resize') {
    const handleCursors = {
        'n': 'ns-resize', 's': 'ns-resize', 'e': 'ew-resize', 'w': 'ew-resize',
        'ne': 'nesw-resize', 'nw': 'nwse-resize', 'se': 'nwse-resize', 'sw': 'nesw-resize'
    };
    cursorStyle = handleCursors[currentAdjustment.handle] || 'move';
  }

  let drawnBoxStyle = {};
  if (drawing && currentRect && scaleX > 0 && scaleY > 0) {
    const minX = Math.min(currentRect.start.x, currentRect.end.x) * scaleX;
    const minY = Math.min(currentRect.start.y, currentRect.end.y) * scaleY;
    const width = Math.abs(currentRect.start.x - currentRect.end.x) * scaleX;
    const height = Math.abs(currentRect.start.y - currentRect.end.y) * scaleY;

    drawnBoxStyle = {
      position: 'absolute',
      left: `${minX}px`,
      top: `${minY}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: `2px dashed #00bfff`, 
      backgroundColor: '#00bfff20',
      pointerEvents: 'none', 
      boxSizing: 'border-box',
    };
  }

  const handleHandleMouseDown = (e) => {
    if (isCandidateImage && tool === 'adjust') {
        handleMouseDown(e); 
    }
  };
  
  const handleBoxContentMouseDown = (e) => {
      if (isCandidateImage && tool === 'adjust') {
        handleMouseDown(e); 
      } else {
        e.stopPropagation();
      }
  };

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
        style={{ cursor: cursorStyle }}
      >
        <div 
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: (dragging || currentAdjustment) ? 'none' : 'transform 0.2s ease',
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
          
          {/* Currently drawn anomaly box */}
          {drawnBoxStyle.width > 0 && <div style={drawnBoxStyle} />}

          {/* Bounding boxes overlay */}
          {boxes && boxes.length > 0 && scaleX > 0 && scaleY > 0 && boxes.map((boxData, index) => {
            if (boxData.deleted) {
              return null;
            }
            
            const [x, y, w, h] = boxData.coords;
            
            const boxLeft = x * scaleX;
            const boxTop = y * scaleY;
            const boxWidth = w * scaleX;
            const boxHeight = h * scaleY;
            
            const color = getFaultColor(index, boxInfo);
            const isAdjusting = currentAdjustment?.index === index;
            const isActiveTool = isCandidateImage && tool === 'adjust';

            const boxStyle = {
              position: 'absolute',
              left: `${boxLeft}px`,
              top: `${boxTop}px`,
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              border: `2px ${isAdjusting ? 'dashed' : 'solid'} ${color}`,
              backgroundColor: `${color}20`,
              boxSizing: 'border-box',
              cursor: isActiveTool ? 'move' : 'default',
            };

            return (
              <div key={index} style={boxStyle} className="box-content" data-index={index} onMouseDown={handleBoxContentMouseDown}>
                
                {/* Error Number in Left Upper Corner */}
                <div 
                  className="absolute -top-6 -left-1 bg-white px-2 py-1 rounded text-xs font-bold shadow pointer-events-none"
                  style={{ color: color }}
                >
                  {index + 1}
                </div>
                
                {/* X Mark in Right Upper Corner */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBox(index);
                  }}
                  className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center text-sm font-bold shadow-md"
                  style={{ pointerEvents: isActiveTool ? 'none' : 'auto' }} 
                >
                  &times;
                </button>
                
                {/* RESIZE HANDLES */}
                {isActiveTool && (
                    <>
                        {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(handle => (
                            <div 
                                key={handle}
                                data-handle={handle}
                                data-index={index}
                                className={`box-handle w-3 h-3 bg-white border border-gray-600 absolute rounded-full shadow-md`}
                                style={{ 
                                    cursor: `${handle}-resize`,
                                    top: ['n', 'ne', 'nw'].includes(handle) ? '-6px' : ['s', 'se', 'sw'].includes(handle) ? `${boxHeight - 6}px` : `${boxHeight / 2 - 6}px`,
                                    left: ['w', 'nw', 'sw'].includes(handle) ? '-6px' : ['e', 'ne', 'se'].includes(handle) ? `${boxWidth - 6}px` : `${boxWidth / 2 - 6}px`,
                                    zIndex: 10,
                                }}
                                onMouseDown={handleHandleMouseDown}
                                onClick={(e) => e.stopPropagation()} 
                            />
                        ))}
                    </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Existing Component: ErrorRulesetModal (Unchanged) ---

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


// --- Main Thermal Analysis Component (Modified) ---

export default function ThermalAnalysis({ initialBaselineFile = null, initialCandidateFile = null, autoStart = true, userName }) {
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
  
  const [showAddAnomalyModal, setShowAddAnomalyModal] = useState(false);
  const [drawingAnomaly, setDrawingAnomaly] = useState(null);
  const [currentAdjustment, setCurrentAdjustment] = useState(null);
  
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
    setDrawingAnomaly(null);
    setCurrentAdjustment(null); 
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
      const resultsWithDeletionStatus = {
        ...analysisResults,
        boxInfo: analysisResults.boxInfo ? analysisResults.boxInfo.map(box => ({ ...box, deleted: false, isManual: false })) : [],
        boxes: analysisResults.boxes ? analysisResults.boxes.map(box => ({ coords: box, deleted: false })) : []
      };
      setResults(resultsWithDeletionStatus);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };
  
  const handleDeleteBox = (index) => {
    setResults(prevResults => {
      if (!prevResults || !prevResults.boxInfo || !prevResults.boxes) return prevResults;

      const newBoxInfo = [...prevResults.boxInfo];
      const newBoxes = [...prevResults.boxes];
      
      if (index >= 0 && index < newBoxInfo.length) {
        newBoxInfo[index] = {
          ...newBoxInfo[index],
          deleted: true,
          deletedBy: userName,
          deletedAt: new Date().toISOString()
        };
        
        newBoxes[index] = {
          ...newBoxes[index],
          deleted: true,
        };
      }

      return {
        ...prevResults,
        boxInfo: newBoxInfo,
        boxes: newBoxes,
      };
    });
  };

  const handleStartDrawAnomaly = () => {
    if (!candidateFile) {
      setError('Please upload a Thermal Image first to add an anomaly.');
      return;
    }
    setShowAddAnomalyModal(true);
  };
  
  const handleConfirmAnomalyRule = (rule) => {
    setDrawingAnomaly(rule);
    setTool('drawAnomaly');
  };

  const handleDrawAnomaly = (newBoxCoords) => {
    setTool(null);
    setDrawingAnomaly(null);

    setResults(prevResults => {
      
      const imageWidth = prevResults?.imageWidth || 1000;
      const imageHeight = prevResults?.imageHeight || 1000;
      const imageAreaProxy = imageWidth * imageHeight;
      
      const [x, y, w, h] = newBoxCoords;
      const boxArea = w * h;
      const areaFrac = boxArea / imageAreaProxy;

      const newBox = {
        coords: newBoxCoords,
        deleted: false,
      };
      
      const newBoxInfoItem = {
        boxFault: drawingAnomaly, 
        label: drawingAnomaly,
        areaFrac: areaFrac, 
        isManual: true, 
        createdBy: userName, 
        deleted: false,
      };

      const existingBoxes = prevResults?.boxes || [];
      const existingBoxInfo = prevResults?.boxInfo || [];
      
      return {
        ...prevResults,
        success: true,
        imageWidth: imageWidth,
        imageHeight: imageHeight,
        boxes: [...existingBoxes, newBox],
        boxInfo: [...existingBoxInfo, newBoxInfoItem]
      };
    });
  };
  
  React.useEffect(() => {
    if (initialBaselineFile) setBaselineFile(initialBaselineFile);
    if (initialCandidateFile) setCandidateFile(initialCandidateFile);

    if (autoStart && initialBaselineFile && initialCandidateFile) {
      (async () => {
        setAnalyzing(true);
        setError(null);
        setResults(null);
        try {
          const analysisResults = await analyzeThermalImagesUpload(initialBaselineFile, initialCandidateFile);
          const resultsWithDeletionStatus = {
            ...analysisResults,
            boxInfo: analysisResults.boxInfo ? analysisResults.boxInfo.map(box => ({ ...box, deleted: false, isManual: false })) : [],
            boxes: analysisResults.boxes ? analysisResults.boxes.map(box => ({ coords: box, deleted: false })) : []
          };
          setResults(resultsWithDeletionStatus);
        } catch (err) {
          setError(`Analysis failed: ${err.message}`);
        } finally {
          setAnalyzing(false);
        }
      })();
    }
  }, [initialBaselineFile, initialCandidateFile, autoStart]);

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
      
      {/* File Upload Section (Unchanged) */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Thermal Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Image Upload (Unchanged) */}
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

          {/* Candidate Image Upload (Unchanged) */}
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

        {/* Action Buttons (Unchanged) */}
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

        {/* Error Display (Unchanged) */}
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
                  onDeleteBox={handleDeleteBox}
                  isCandidateImage={true}
                  onDrawAnomaly={handleDrawAnomaly}
                  drawingAnomaly={drawingAnomaly}
                  currentAdjustment={currentAdjustment}
                  setCurrentAdjustment={setCurrentAdjustment}
                  setResults={setResults}
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
                disabled={drawingAnomaly !== null}
              >
                ✋ Drag
              </button>

              {/* NEW BUTTON: Adjust Marker */}
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded w-full font-semibold transition-colors ${
                  tool === 'adjust'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setTool('adjust')}
                disabled={drawingAnomaly !== null}
              >
                ↔️ Adjust Marker
              </button>
              
              <div className="w-full">
                <p className="text-xs text-gray-600 mb-1 font-medium">Zoom Controls</p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    onClick={handleZoomIn}
                    disabled={drawingAnomaly !== null}
                  >
                    🔍 +
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    onClick={handleZoomOut}
                    disabled={drawingAnomaly !== null}
                  >
                    🔍 −
                  </button>
                </div>
              </div>
              
              <button
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 w-full"
                onClick={handleResetView}
              >
                🔄 Reset View
              </button>

              {/* NEW BUTTON: Add Anomaly */}
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded w-full font-semibold transition-colors ${
                  tool === 'drawAnomaly'
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                onClick={handleStartDrawAnomaly}
                disabled={!candidateFile} 
              >
                ✏️ Add Anomaly
              </button>

              <button
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
                onClick={() => setShowRulesetModal(true)}
              >
                ⚙️ Error Ruleset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Ruleset Modal (Unchanged) */}
      <ErrorRulesetModal 
        isOpen={showRulesetModal}
        onClose={() => setShowRulesetModal(false)}
        ruleset={ruleset}
        setRuleset={setRuleset}
      />
      
      {/* NEW MODAL: Add Anomaly Modal */}
      <AddAnomalyModal
        isOpen={showAddAnomalyModal}
        onClose={() => setShowAddAnomalyModal(false)}
        onConfirm={handleConfirmAnomalyRule}
      />

      {/* Results Section (Unchanged) */}
      {results && (
        <AnalysisResults 
          results={results} 
          processingTime={results.processingTimeMs || 0} 
        />
      )}

      {/* Notes Section (Unchanged) */}
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