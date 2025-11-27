import React, { useState, useEffect } from "react";
// Assuming you have an API function to fetch detailed transformer data
import { getTransformers, addGeneralRecord, addMaintenanceRecord, addWorkDataSheet } from "./API"; 
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

export default function DigitalInspectionForm({ inspection, onSave, onCancel }) {
  const [transformer, setTransformer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general'); // Tab state: 'general', 'maintenance', 'workdata'
  const [form, setForm] = useState({
    // Initial values populated from the inspection object
    date: inspection.inspected || new Date().toISOString().split('T')[0],
    time: inspection.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    inspectorName: inspection.inspector || '', // e.g., 'A-110' [cite: 131]
    transformerStatus: inspection.status || 'OK',
    recommendedAction: '',
    additionalRemarks: '',
    voltageR: '', voltageY: '', voltageB: '',
    currentR: '', currentY: '', currentB: '',
    // Add fields for second inspection readings as per PDF [cite: 100]
    voltageR2: '', voltageY2: '', voltageB2: '',
    currentR2: '', currentY2: '', currentB2: '',
    // Maintenance Record fields
    startTime: '',
    completionTime: '',
    supervisedBy: '',
    techI: '',
    techII: '',
    techIII: '',
    helpers: '',
    inspectedBy: '',
    inspectedDate: '',
    rectifiedBy: '',
    rectifiedDate: '',
    reInspectedBy: '',
    reInspectedDate: '',
    css1: '',
    css1Date: '',
    allSpotsCorrect: false,
    css2: '',
    css2Date: '',
    // Work - Data Sheet fields
    gangLeader: '',
    workDate: '',
    jobStartedTime: '',
    serialNo: '',
    kva: '',
    make: '',
    tapPosition: '',
    txCtRation: '',
    manufactureYear: '',
    earthResistance: '',
    neutral: '',
    surgeOrBody: '', // 'surge' or 'body'
    fdsF1: false,
    fdsF1A: '',
    fdsF2: false,
    fdsF2A: '',
    fdsF3: false,
    fdsF3A: '',
    fdsF4: false,
    fdsF4A: '',
    fdsF5: false,
    fdsF5A: '',
    jobCompletedTime: '',
    workNotes: '',
    materials: {
      copperWire16mm2: false,
      abcWire70mm2: false,
      aluminumBinding14mm2: false,
      earthWire50mm2: false,
      aac60mm2: false,
      copperLug16mm2: false,
      copperLug50mm2: false,
      ctLug25mm2: false,
      bimetallicLug35mm2: false,
      bimetallicLug50mm2: false,
    },
  });

  // Fetch Transformer Details (for non-editable fields)
  useEffect(() => {
    async function fetchTransformerDetails() {
      try {
        // In a real app, you would fetch a single transformer by its No.
        // For this example, we fetch all and find the match.
        const allTransformers = await getTransformers();
        const foundTransformer = allTransformers.find(
          t => t.transformerNo === inspection.transformerNo || t.no === inspection.transformerNo // Match by either field
        );
        setTransformer(foundTransformer);
      } catch (error) {
        console.error("Error fetching transformer details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransformerDetails();
  }, [inspection.transformerNo]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  
  // Handlers for Save and Edit buttons
  const handleSave = async () => {
    try {
      if (activeTab === "general") {
        await addGeneralRecord(form);
        console.log("General record saved successfully");
      } else if (activeTab === "maintenance") {
        await addMaintenanceRecord(form);
        console.log("Maintenance record saved successfully");
      } else if (activeTab === "workdata") {
        await addWorkDataSheet(form);
        console.log("Work data sheet saved successfully");
      }
      onSave();
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading transformer details...</div>;
  }

  // Fallback for non-editable fields if transformer details are missing
  const { region = 'N/A', transformerNo = inspection.transformerNo, poleNo = 'N/A', locationDetails = 'N/A' } = transformer || {};

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        
        {/* Header: Digital Inspection Form  */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          Digital Inspection Form
        </h1>

        {/* --- Non-Editable Transformer Details --- */}
        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-indigo-50 rounded-md">
          <DetailField label="Region" value={region} isReadOnly={true} />
          <DetailField label="Transformer No." value={transformerNo} isReadOnly={true} />
          <DetailField label="Pole No." value={poleNo} isReadOnly={true} />
          <DetailField label="Location Details" value={locationDetails} isReadOnly={true} />
        </div>

        {/* --- Tab Navigation --- */}
        <div className="mb-6 border-b border-gray-300">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 font-medium text-sm transition-all ${
                activeTab === 'general'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              1. General Record
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-6 py-3 font-medium text-sm transition-all ${
                activeTab === 'maintenance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              2. Maintenance Record
            </button>
            <button
              onClick={() => setActiveTab('workdata')}
              className={`px-6 py-3 font-medium text-sm transition-all ${
                activeTab === 'workdata'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              3. Work - Data Sheet
            </button>
          </div>
        </div>

        {/* --- Tab Content --- */}
        {activeTab === 'general' && (
          <div>
        
        {/* --- Date and Time Fields --- */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <InputField
                label="Date of Inspection"
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                icon={FaCalendarAlt}
            />
            <InputField
                label="Time"
                type="time"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
                icon={FaClock}
            />
        </div>

        {/* --- Editable Engineer Input Fields --- */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Engineer Input Fields</h2>

        <div className="space-y-6">
            <InputField
                label="Inspected By (Name/ID)"
                placeholder="Engineer's Name or ID (e.g., A-110)"
                value={form.inspectorName}
                onChange={(e) => handleChange("inspectorName", e.target.value)}
            />

            <SelectField
                label="Transformer Status"
                value={form.transformerStatus}
                onChange={(e) => handleChange("transformerStatus", e.target.value)}
                options={['OK', 'Needs Maintenance', 'Urgent Attention']}
            />
            
            {/* Voltage and Current Readings Section (First Inspection) [cite: 99] */}
            <ReadingsSection 
                title="First Inspection Voltage & Current Readings"
                form={form} 
                handleChange={handleChange} 
                prefix="First"
            />

            {/* Voltage and Current Readings Section (Second Inspection) [cite: 100] */}
            <ReadingsSection 
                title="Second Inspection Voltage & Current Readings"
                form={form} 
                handleChange={handleChange} 
                prefix="Second"
            />
            
            <TextAreaField
                label="Recommended Action"
                placeholder="e.g., Tightening connections, cleaning cooling fins..."
                value={form.recommendedAction}
                onChange={(e) => handleChange("recommendedAction", e.target.value)}
            />
            <TextAreaField
                label="Additional Remarks"
                placeholder="Any other notes or observations."
                value={form.additionalRemarks}
                onChange={(e) => handleChange("additionalRemarks", e.target.value)}
            />
        </div>
        
        {/* --- Thermal Image Field (Placeholder) --- */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Baseline Image</h2>
          <div className="h-40 bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center rounded text-gray-600">
            [Image Field Placeholder: Image will be fetched from backend.]
          </div>
        </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Maintenance Record</h2>
            
            {/* Start Time, Completion Time, Supervised BY */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <InputField
                label="Start Time"
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                placeholder="--:-- --"
                icon={FaClock}
              />
              <InputField
                label="Completion Time"
                type="time"
                value={form.completionTime}
                onChange={(e) => handleChange("completionTime", e.target.value)}
                placeholder="--:-- --"
                icon={FaClock}
              />
              <InputField
                label="Supervised BY"
                value={form.supervisedBy}
                onChange={(e) => handleChange("supervisedBy", e.target.value)}
                placeholder="e.g., A-221"
              />
            </div>

            {/* Gang Composition */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gang Composition</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Tech I"
                  value={form.techI}
                  onChange={(e) => handleChange("techI", e.target.value)}
                  placeholder="e.g., T-112"
                />
                <InputField
                  label="Tech II"
                  value={form.techII}
                  onChange={(e) => handleChange("techII", e.target.value)}
                  placeholder="e.g., A-110"
                />
                <InputField
                  label="Tech III"
                  value={form.techIII}
                  onChange={(e) => handleChange("techIII", e.target.value)}
                  placeholder="e.g., A-110"
                />
                <InputField
                  label="Helpers"
                  value={form.helpers}
                  onChange={(e) => handleChange("helpers", e.target.value)}
                  placeholder="e.g., H-245"
                />
              </div>
            </div>

            {/* Inspected By & Date */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <SelectField
                label="Inspected By"
                value={form.inspectedBy}
                onChange={(e) => handleChange("inspectedBy", e.target.value)}
                options={['', 'A-110', 'T-112', 'P-453', 'Other']}
              />
              <InputField
                label="Date"
                type="date"
                value={form.inspectedDate}
                onChange={(e) => handleChange("inspectedDate", e.target.value)}
                placeholder="mm/dd/yyyy"
                icon={FaCalendarAlt}
              />
            </div>

            {/* Rectified By & Date */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <SelectField
                label="Rectified By"
                value={form.rectifiedBy}
                onChange={(e) => handleChange("rectifiedBy", e.target.value)}
                options={['', 'P-453', 'A-110', 'T-112', 'Other']}
              />
              <InputField
                label="Date"
                type="date"
                value={form.rectifiedDate}
                onChange={(e) => handleChange("rectifiedDate", e.target.value)}
                placeholder="mm/dd/yyyy"
                icon={FaCalendarAlt}
              />
            </div>

            {/* Re Inspected By & Date */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <SelectField
                label="Re Inspected By"
                value={form.reInspectedBy}
                onChange={(e) => handleChange("reInspectedBy", e.target.value)}
                options={['', 'A-110', 'T-112', 'P-453', 'Other']}
              />
              <InputField
                label="Date"
                type="date"
                value={form.reInspectedDate}
                onChange={(e) => handleChange("reInspectedDate", e.target.value)}
                placeholder="mm/dd/yyyy"
                icon={FaCalendarAlt}
              />
            </div>

            {/* CSS & Date */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <SelectField
                label="CSS"
                value={form.css1}
                onChange={(e) => handleChange("css1", e.target.value)}
                options={['', 'A-110', 'T-112', 'P-453', 'Other']}
              />
              <InputField
                label="Date"
                type="date"
                value={form.css1Date}
                onChange={(e) => handleChange("css1Date", e.target.value)}
                placeholder="mm/dd/yyyy"
                icon={FaCalendarAlt}
              />
            </div>

            {/* Checkbox: All Identified spots were corrected */}
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allSpotsCorrect}
                  onChange={(e) => handleChange("allSpotsCorrect", e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">All Identified spots were corrected</span>
              </label>
            </div>

            {/* CSS & Date (Second) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <SelectField
                label="CSS"
                value={form.css2}
                onChange={(e) => handleChange("css2", e.target.value)}
                options={['', 'A-110', 'T-112', 'P-453', 'Other']}
              />
              <InputField
                label="Date"
                type="date"
                value={form.css2Date}
                onChange={(e) => handleChange("css2Date", e.target.value)}
                placeholder="mm/dd/yyyy"
                icon={FaCalendarAlt}
              />
            </div>
          </div>
        )}

        {activeTab === 'workdata' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Work - Data Sheet</h2>
            
            {/* Gang Leader, Date, Job Started Time */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <SelectField
                label="Gang Leader"
                value={form.gangLeader}
                onChange={(e) => handleChange("gangLeader", e.target.value)}
                options={['', 'P-453', 'A-110', 'T-112', 'Other']}
              />
              <InputField
                label="Date"
                type="date"
                value={form.workDate}
                onChange={(e) => handleChange("workDate", e.target.value)}
                placeholder="mm/dd/yyyy"
                icon={FaCalendarAlt}
              />
              <InputField
                label="Job Started Time"
                type="time"
                value={form.jobStartedTime}
                onChange={(e) => handleChange("jobStartedTime", e.target.value)}
                placeholder="--:-- --"
                icon={FaClock}
              />
            </div>

            {/* Serial No., kVA, Make */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <InputField
                label="Serial No."
                value={form.serialNo}
                onChange={(e) => handleChange("serialNo", e.target.value)}
                placeholder="e.g., J-14-V016010026"
              />
              <SelectField
                label="kVA"
                value={form.kva}
                onChange={(e) => handleChange("kva", e.target.value)}
                options={['', '50', '100', '160', '200', '250', '315', '400', '500']}
              />
              <SelectField
                label="Make"
                value={form.make}
                onChange={(e) => handleChange("make", e.target.value)}
                options={['', 'LTL', 'CGL', 'Siemens', 'ABB', 'Other']}
              />
            </div>

            {/* Tap Position, Tx CT Ration, Manufacture Year */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <SelectField
                label="Tap Position"
                value={form.tapPosition}
                onChange={(e) => handleChange("tapPosition", e.target.value)}
                options={['', '1', '2', '3', '4', '5']}
              />
              <InputField
                label="Tx CT Ration"
                value={form.txCtRation}
                onChange={(e) => handleChange("txCtRation", e.target.value)}
                placeholder="e.g., 300/5A"
              />
              <InputField
                label="Manufacture Year"
                value={form.manufactureYear}
                onChange={(e) => handleChange("manufactureYear", e.target.value)}
                placeholder="e.g., 2014"
              />
            </div>

            {/* Earth Resistance & Neutral */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Earth Resistance</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.earthResistance}
                    onChange={(e) => handleChange("earthResistance", e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">Ω</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Neutral</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.neutral}
                    onChange={(e) => handleChange("neutral", e.target.value)}
                    placeholder="-"
                    className="w-full border border-gray-300 rounded p-2 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">Ω</span>
                </div>
              </div>
            </div>

            {/* Radio buttons: Surge / Body */}
            <div className="flex items-center space-x-6 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="surgeOrBody"
                  value="surge"
                  checked={form.surgeOrBody === 'surge'}
                  onChange={(e) => handleChange("surgeOrBody", e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Surge</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="surgeOrBody"
                  value="body"
                  checked={form.surgeOrBody === 'body'}
                  onChange={(e) => handleChange("surgeOrBody", e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Body</span>
              </label>
            </div>

            {/* FDS Fuse Ratings */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">FDS Fuse Ratings</h3>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">F{num}</span>
                      <input
                        type="checkbox"
                        checked={form[`fdsF${num}`]}
                        onChange={(e) => handleChange(`fdsF${num}`, e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </label>
                    <input
                      type="text"
                      value={form[`fdsF${num}A`]}
                      onChange={(e) => handleChange(`fdsF${num}A`, e.target.value)}
                      placeholder="A"
                      className="w-20 border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Job Completed Time */}
            <div className="mb-6">
              <InputField
                label="Job Completed Time"
                type="time"
                value={form.jobCompletedTime}
                onChange={(e) => handleChange("jobCompletedTime", e.target.value)}
                placeholder="--:-- --"
                icon={FaClock}
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
              <textarea
                value={form.workNotes}
                onChange={(e) => handleChange("workNotes", e.target.value)}
                placeholder="Detected minor overheating on the transformer's secondary winding during peak load hours. Hotspot temperature measured at 112.2°F, slightly above tolerance threshold for current load profile. Recommend tightening connections on the affected phase, cleaning cooling fins, and rechecking temperature during next inspection cycle. No immediate outage required."
                rows="5"
                className="w-full border border-gray-300 rounded p-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Materials/Items Used */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Materials/Items Used</h3>
              <div className="space-y-3">
                <MaterialItem 
                  label="16mm2 Copper wire" 
                  code="B112"
                  checked={form.materials.copperWire16mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, copperWire16mm2: checked })}
                />
                <MaterialItem 
                  label="70mm2 ABC wire" 
                  code="B244"
                  checked={form.materials.abcWire70mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, abcWire70mm2: checked })}
                />
                <MaterialItem 
                  label="Aluminum binding 14mm2" 
                  code="B712"
                  checked={form.materials.aluminumBinding14mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, aluminumBinding14mm2: checked })}
                />
                <MaterialItem 
                  label="50mm2 Earth Wire" 
                  code="B815"
                  checked={form.materials.earthWire50mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, earthWire50mm2: checked })}
                />
                <MaterialItem 
                  label="60mm2 AAC" 
                  code="C113"
                  checked={form.materials.aac60mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, aac60mm2: checked })}
                />
                <MaterialItem 
                  label="Copper Lug 16mm2" 
                  code="G332"
                  checked={form.materials.copperLug16mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, copperLug16mm2: checked })}
                />
                <MaterialItem 
                  label="Copper Lug 50mm2" 
                  code="G354"
                  checked={form.materials.copperLug50mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, copperLug50mm2: checked })}
                />
                <MaterialItem 
                  label="C/T Lug 2.5mm2" 
                  code="G360"
                  checked={form.materials.ctLug25mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, ctLug25mm2: checked })}
                />
                <MaterialItem 
                  label="Bimetallic Lug 35mm2" 
                  code="G373A"
                  checked={form.materials.bimetallicLug35mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, bimetallicLug35mm2: checked })}
                />
                <MaterialItem 
                  label="Bimetallic Lug 50mm2" 
                  code="G374"
                  checked={form.materials.bimetallicLug50mm2}
                  onChange={(checked) => handleChange("materials", { ...form.materials, bimetallicLug50mm2: checked })}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- Save/Edit Buttons [cite: 118, 119] --- */}
        <div className="flex justify-between gap-4 mt-8 pt-4 border-t">
          <button
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            onClick={onCancel}
          >
            Back
          </button>
          <div className="flex gap-4">
            <button
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              onClick={onCancel}
            >
              Edit
            </button>
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components for cleaner code ---

const DetailField = ({ label, value, isReadOnly }) => (
  <div className="flex flex-col">
    <label className="text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      readOnly={isReadOnly}
      className={`w-full border rounded p-2 text-sm ${isReadOnly ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-white border-gray-300'}`}
    />
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, icon: Icon }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded p-2 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
      />
      {Icon && <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
    </div>
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows="3"
            className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const ReadingsSection = ({ title, form, handleChange, prefix }) => (
    <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-lg mb-3">{title}</h3>
        <div className="grid grid-cols-3 gap-4">
            {/* Voltage (V) [cite: 106] */}
            <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Voltage (V)</label>
                <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="R" className="border rounded p-2 text-sm" 
                           value={form[`voltageR${prefix === 'Second' ? '2' : ''}`]} 
                           onChange={(e) => handleChange(`voltageR${prefix === 'Second' ? '2' : ''}`, e.target.value)} />
                    <input type="number" placeholder="Y" className="border rounded p-2 text-sm" 
                           value={form[`voltageY${prefix === 'Second' ? '2' : ''}`]} 
                           onChange={(e) => handleChange(`voltageY${prefix === 'Second' ? '2' : ''}`, e.target.value)} />
                    <input type="number" placeholder="B" className="border rounded p-2 text-sm" 
                           value={form[`voltageB${prefix === 'Second' ? '2' : ''}`]} 
                           onChange={(e) => handleChange(`voltageB${prefix === 'Second' ? '2' : ''}`, e.target.value)} />
                </div>
            </div>
            {/* Current (A) [cite: 106] */}
            <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Current (A)</label>
                <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="R" className="border rounded p-2 text-sm" 
                           value={form[`currentR${prefix === 'Second' ? '2' : ''}`]} 
                           onChange={(e) => handleChange(`currentR${prefix === 'Second' ? '2' : ''}`, e.target.value)} />
                    <input type="number" placeholder="Y" className="border rounded p-2 text-sm" 
                           value={form[`currentY${prefix === 'Second' ? '2' : ''}`]} 
                           onChange={(e) => handleChange(`currentY${prefix === 'Second' ? '2' : ''}`, e.target.value)} />
                    <input type="number" placeholder="B" className="border rounded p-2 text-sm" 
                           value={form[`currentB${prefix === 'Second' ? '2' : ''}`]} 
                           onChange={(e) => handleChange(`currentB${prefix === 'Second' ? '2' : ''}`, e.target.value)} />
                </div>
            </div>
        </div>
    </div>
);

const MaterialItem = ({ label, code, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
    <span className="text-sm text-gray-700 flex-1">{label}</span>
    <span className="text-sm text-gray-500 w-20 text-center">{code}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    />
  </div>
);