
import React, { useState, useRef } from "react";
import { FaStar, FaRegStar, FaEye, FaTrash, FaEllipsisV, FaMapMarkerAlt } from 'react-icons/fa';
import inspectionsData from './inspections.json';
import ThermalImageUpload from "./ThermalImageUpload";
import transformerImagesJSON from "./TransformerImageList.json";

const statusColors = {
  'In Progress': 'bg-green-100 text-green-700',
  'Pending': 'bg-red-100 text-red-700',
  'Completed': 'bg-purple-100 text-purple-700',
};

export default function TransformerInspectionDetails({ transformer, onBack }) {
  const [showThermal, setShowThermal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showBaselineUpload, setShowBaselineUpload] = useState(false);
  const [baselineProgress, setBaselineProgress] = useState(0);
  const [transformerImages, setTransformerImages] = useState({...transformerImagesJSON});

  React.useEffect(() => {
    void transformerImages;
  }, [transformerImages]);

  const baselineInputRef = useRef(null);
  const baselineUploadInterval = useRef(null);

  // Use transformerNo for matching inspections
  const [inspections, setInspections] = useState(
    inspectionsData.filter(ins => ins.no === transformer.transformerNo)
  );

  const handleBaselineClick = () => baselineInputRef.current.click();

  const handleBaselineFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setShowBaselineUpload(true);
    setBaselineProgress(0);

    baselineUploadInterval.current = setInterval(() => {
      setBaselineProgress(prev => {
        if (prev >= 100) {
          clearInterval(baselineUploadInterval.current);

          // Get current date and time
          const now = new Date();
          const date = now.toISOString().split('T')[0];
          const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Update transformerImages state
          setTransformerImages(prevImages => {
            const newImages = {...prevImages};
            if (!newImages[transformer.no]) {
              newImages[transformer.no] = { Baseline: [], Thermal: [] };
            }
            newImages[transformer.no].Baseline = [file.name, date, time];
            console.log("Updated transformerImages:", newImages);
            return newImages;
          });

          setShowBaselineUpload(false);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const handleCancelBaselineUpload = () => {
    clearInterval(baselineUploadInterval.current);
    setShowBaselineUpload(false);
    setBaselineProgress(0);
  };

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      {/* Transformer header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded bg-indigo-700 flex items-center justify-center text-white">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div>
              <div className="font-semibold text-lg">{transformer.transformerNo}</div>
              <div className="text-xs text-gray-500 flex items-center">
                {transformer.region}
                <FaMapMarkerAlt className="mx-1 text-red-500" />
                <span className="text-red-500">{transformer.locationDetails}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">{transformer.poleNo}</div>
              <div className="text-center text-gray-500 text-xs">Pole No</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">{transformer.capacity || '102.97'}</div>
              <div className="text-center text-gray-500 text-xs">Capacity</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">{transformer.type}</div>
              <div className="text-center text-gray-500 text-xs">Type</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">{inspections.length}</div>
              <div className="text-center text-gray-500 text-xs">No. of Feeders</div>
            </div>
          </div>
        </div>
        {/* Right side buttons */}
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-2">Last Inspected Date: {inspections[0]?.inspected || '-'}</div>
          <div className="flex gap-2 justify-end">
            <button className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1" onClick={handleBaselineClick}>
              <FaEye className="text-gray-600" />
              <span>Baseline Image</span>
            </button>
            <input type="file" ref={baselineInputRef} className="hidden" onChange={handleBaselineFileChange} />
            <button className="bg-gray-50 border border-gray-200 w-7 h-7 rounded-md flex items-center justify-center">
              <FaTrash className="text-red-500 text-xs" />
            </button>
            <button className="bg-gray-50 border border-gray-200 w-7 h-7 rounded-md flex items-center justify-center">
              <FaEllipsisV className="text-indigo-700 text-xs" />
            </button>
          </div>
        </div>
      </div>
      {/* Inspections Table or Thermal Image Upload Section */}
      {showThermal && selectedInspection ? (
        <div className="mt-8">
          <ThermalImageUpload inspection={selectedInspection} />
        </div>
      ) : (
        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Transformer Inspections</h2>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
              onClick={() => {
                // Mock new inspection entry
                const newInspection = {
                  inspectionNo: `INSP${Date.now()}`,
                  inspected: new Date().toISOString().split('T')[0],
                  maintenance: '-',
                  status: 'Pending',
                  no: transformer.transformerNo
                };
                setInspections(prev => [newInspection, ...prev]);
              }}
            >
              Add Inspection
            </button>
          </div>
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-indigo-100 text-indigo-700">
                <th className="py-2 px-4 text-left">Inspection No <span className="text-xs">↓</span></th>
                <th className="py-2 px-4 text-left">Inspected Date</th>
                <th className="py-2 px-4 text-left">Maintenance Date</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((insp, i) => (
                <tr key={insp.inspectionNo + i} className="border-b hover:bg-indigo-50">
                  <td className="py-2 px-4 flex items-center gap-2">
                    {i === 0 ? <FaStar className="text-indigo-600" /> : <FaRegStar className="text-gray-400" />}
                    {insp.inspectionNo}
                  </td>
                  <td className="py-2 px-4">{insp.inspected}</td>
                  <td className="py-2 px-4">{insp.maintenance}</td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 rounded ${statusColors[insp.status]}`}>{insp.status}</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700" onClick={() => { setSelectedInspection(insp); setShowThermal(true); }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Baseline Upload Pop-up */}
      {showBaselineUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 flex flex-col items-center gap-4">
            <h3 className="text-xl font-bold">Uploading Baseline Image</h3>
            <div className="w-full bg-indigo-200 rounded-full h-4 overflow-hidden">
              <div className="bg-indigo-600 h-4 transition-all duration-200" style={{ width: `${baselineProgress}%` }}></div>
            </div>
            <span className="text-sm text-gray-700 font-medium">{baselineProgress}%</span>
            <button className="bg-white text-gray-600 px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 w-auto" onClick={handleCancelBaselineUpload}>Cancel</button>
          </div>
        </div>
      )}
      <div className="mt-6">
        <button className="text-indigo-600" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}