import React, { useState, useEffect } from "react";
// Assuming you have an API function to fetch detailed transformer data
import { getTransformers } from "./API"; 
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

export default function DigitalInspectionForm({ inspection, onSave, onCancel }) {
  const [transformer, setTransformer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
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
  const handleSave = () => {
    // In a real application, you would call an API to save the form data.
    // For now, it just calls the onSave prop, which handles navigation.
    console.log("Saving form data:", form);
    onSave();
  };

  if (loading) {
    return <div className="p-8 text-center">Loading transformer details...</div>;
  }

  // Fallback for non-editable fields if transformer details are missing
  const { region = 'N/A', transformerNo = inspection.transformerNo, poleNo = 'N/A', locationDetails = 'N/A' } = transformer || {};

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        
        {/* Header: Thermal Image Inspection Form  */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          Thermal Image Inspection Form
        </h1>

        {/* --- Non-Editable Transformer Details --- */}
        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-indigo-50 rounded-md">
          <DetailField label="Region" value={region} isReadOnly={true} />
          <DetailField label="Transformer No." value={transformerNo} isReadOnly={true} />
          <DetailField label="Pole No." value={poleNo} isReadOnly={true} />
          <DetailField label="Location Details" value={locationDetails} isReadOnly={true} />
        </div>

        {/* --- Tab Navigation --- */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 0
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab(0)}
          >
            1. General Record
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 1
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab(1)}
          >
            2. Maintenance Record
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 2
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab(2)}
          >
            3. Work - Data Sheet
          </button>
        </div>
        
        {/* --- Tab Content --- */}
        {activeTab === 0 && (
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

        {activeTab === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Maintenance Record</h2>
            <div className="space-y-6">
              {/* Time Fields */}
              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="Start Time"
                  type="time"
                  value={form.startTime || ''}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  icon={FaClock}
                />
                <InputField
                  label="Completion Time"
                  type="time"
                  value={form.completionTime || ''}
                  onChange={(e) => handleChange("completionTime", e.target.value)}
                  icon={FaClock}
                />
                <InputField
                  label="Supervised BY"
                  placeholder="e.g., A-221"
                  value={form.supervisedBy || ''}
                  onChange={(e) => handleChange("supervisedBy", e.target.value)}
                />
              </div>

              {/* Gang Composition Section */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-4">Gang Composition</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Tech I"
                    placeholder="e.g., T-112"
                    value={form.techI || ''}
                    onChange={(e) => handleChange("techI", e.target.value)}
                  />
                  <InputField
                    label="Tech II"
                    placeholder="e.g., A-110"
                    value={form.techII || ''}
                    onChange={(e) => handleChange("techII", e.target.value)}
                  />
                  <InputField
                    label="Tech III"
                    placeholder="e.g., A-110"
                    value={form.techIII || ''}
                    onChange={(e) => handleChange("techIII", e.target.value)}
                  />
                  <InputField
                    label="Helpers"
                    placeholder="e.g., H-245"
                    value={form.helpers || ''}
                    onChange={(e) => handleChange("helpers", e.target.value)}
                  />
                </div>
              </div>

              {/* Inspection and Verification Records */}
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Inspected By"
                  value={form.inspectedBy || 'A-110'}
                  onChange={(e) => handleChange("inspectedBy", e.target.value)}
                  options={['A-110', 'A-221', 'P-453', 'T-112', 'H-245']}
                />
                <InputField
                  label="Date"
                  type="date"
                  value={form.inspectedDate || ''}
                  onChange={(e) => handleChange("inspectedDate", e.target.value)}
                  icon={FaCalendarAlt}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Rectified By"
                  value={form.rectifiedBy || 'P-453'}
                  onChange={(e) => handleChange("rectifiedBy", e.target.value)}
                  options={['A-110', 'A-221', 'P-453', 'T-112', 'H-245']}
                />
                <InputField
                  label="Date"
                  type="date"
                  value={form.rectifiedDate || ''}
                  onChange={(e) => handleChange("rectifiedDate", e.target.value)}
                  icon={FaCalendarAlt}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Re Inspected By"
                  value={form.reInspectedBy || 'A-110'}
                  onChange={(e) => handleChange("reInspectedBy", e.target.value)}
                  options={['A-110', 'A-221', 'P-453', 'T-112', 'H-245']}
                />
                <InputField
                  label="Date"
                  type="date"
                  value={form.reInspectedDate || ''}
                  onChange={(e) => handleChange("reInspectedDate", e.target.value)}
                  icon={FaCalendarAlt}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="CSS"
                  value={form.css || 'A-110'}
                  onChange={(e) => handleChange("css", e.target.value)}
                  options={['A-110', 'A-221', 'P-453', 'T-112', 'H-245']}
                />
                <InputField
                  label="Date"
                  type="date"
                  value={form.cssDate || ''}
                  onChange={(e) => handleChange("cssDate", e.target.value)}
                  icon={FaCalendarAlt}
                />
              </div>

              {/* Checkbox for corrected spots */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  id="spotsCorrect"
                  checked={form.allSpotsCorrect || false}
                  onChange={(e) => handleChange("allSpotsCorrect", e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="spotsCorrect" className="text-sm font-medium text-gray-700">
                  All Identified spots were corrected
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="CSS"
                  value={form.css2 || 'A-110'}
                  onChange={(e) => handleChange("css2", e.target.value)}
                  options={['A-110', 'A-221', 'P-453', 'T-112', 'H-245']}
                />
                <InputField
                  label="Date"
                  type="date"
                  value={form.css2Date || ''}
                  onChange={(e) => handleChange("css2Date", e.target.value)}
                  icon={FaCalendarAlt}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Work - Data Sheet</h2>
            <div className="space-y-6">
              {/* First Row: Gang Leader, Date, Job Started Time */}
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Gang Leader"
                  value={form.gangLeader || 'P-453'}
                  onChange={(e) => handleChange("gangLeader", e.target.value)}
                  options={['P-453', 'A-110', 'A-221', 'T-112', 'H-245']}
                />
                <InputField
                  label="Date"
                  type="date"
                  value={form.workDate || ''}
                  onChange={(e) => handleChange("workDate", e.target.value)}
                  icon={FaCalendarAlt}
                />
                <InputField
                  label="Job Started Time"
                  type="time"
                  value={form.jobStartedTime || ''}
                  onChange={(e) => handleChange("jobStartedTime", e.target.value)}
                  icon={FaClock}
                />
              </div>

              {/* Second Row: Serial No, kVA, Make */}
              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="Serial No."
                  placeholder="e.g., J-14-V016010026"
                  value={form.serialNo || ''}
                  onChange={(e) => handleChange("serialNo", e.target.value)}
                />
                <SelectField
                  label="kVA"
                  value={form.kva || '50'}
                  onChange={(e) => handleChange("kva", e.target.value)}
                  options={['25', '50', '100', '160', '250', '315', '500']}
                />
                <SelectField
                  label="Make"
                  value={form.make || 'LTL'}
                  onChange={(e) => handleChange("make", e.target.value)}
                  options={['LTL', 'Siemens', 'ABB', 'Schneider', 'Other']}
                />
              </div>

              {/* Third Row: Tap Position, Tx CT Ration, Manufacture Year */}
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Tap Position"
                  value={form.tapPosition || '1'}
                  onChange={(e) => handleChange("tapPosition", e.target.value)}
                  options={['1', '2', '3', '4', '5']}
                />
                <InputField
                  label="Tx CT Ration"
                  placeholder="e.g., 300/5A"
                  value={form.txCtRation || ''}
                  onChange={(e) => handleChange("txCtRation", e.target.value)}
                />
                <InputField
                  label="Manufacture Year"
                  type="number"
                  placeholder="e.g., 2014"
                  value={form.manufactureYear || ''}
                  onChange={(e) => handleChange("manufactureYear", e.target.value)}
                />
              </div>

              {/* Fourth Row: Earth Resistance, Neutral */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <InputField
                    label="Earth Resistance"
                    placeholder="-"
                    value={form.earthResistance || ''}
                    onChange={(e) => handleChange("earthResistance", e.target.value)}
                  />
                  <span className="mt-6 text-gray-600">Ω</span>
                </div>
                <div className="flex items-center gap-2">
                  <InputField
                    label="Neutral"
                    placeholder="-"
                    value={form.neutral || ''}
                    onChange={(e) => handleChange("neutral", e.target.value)}
                  />
                  <span className="mt-6 text-gray-600">Ω</span>
                </div>
              </div>

              {/* Radio buttons: Surge/Body */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="surgeBody"
                    value="Surge"
                    checked={form.surgeBody === 'Surge'}
                    onChange={(e) => handleChange("surgeBody", e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Surge</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="surgeBody"
                    value="Body"
                    checked={form.surgeBody === 'Body'}
                    onChange={(e) => handleChange("surgeBody", e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Body</span>
                </label>
              </div>

              {/* FDS Fuse Ratings */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-3">FDS Fuse Ratings</h3>
                <div className="grid grid-cols-5 gap-4">
                  {['F1', 'F2', 'F3', 'F4', 'F5'].map((fuse) => (
                    <div key={fuse} className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">{fuse}</label>
                      <input
                        type="checkbox"
                        checked={form[`fds${fuse}`] || false}
                        onChange={(e) => handleChange(`fds${fuse}`, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder="A"
                        value={form[`fds${fuse}Value`] || ''}
                        onChange={(e) => handleChange(`fds${fuse}Value`, e.target.value)}
                        className="w-12 border border-gray-300 rounded p-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Completed Time */}
              <InputField
                label="Job Completed Time"
                type="time"
                value={form.jobCompletedTime || ''}
                onChange={(e) => handleChange("jobCompletedTime", e.target.value)}
                icon={FaClock}
              />

              {/* Notes */}
              <TextAreaField
                label="Notes"
                placeholder="Detected minor overheating on the transformer's secondary winding during peak load hours. Hotspot temperature measured at 112.2°F, slightly above tolerance threshold for current load profile. Recommend tightening connections on the affected phase, cleaning cooling fins, and rechecking temperature during next inspection cycle. No immediate outage required."
                value={form.workNotes || ''}
                onChange={(e) => handleChange("workNotes", e.target.value)}
                rows={4}
              />

              {/* Materials/Items Section */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-3">Materials/Items Used</h3>
                <div className="space-y-3">
                  {[
                    { label: '16mm2 Copper wire', code: 'B112' },
                    { label: '70mm2 ABC wire', code: 'B244' },
                    { label: 'Aluminum binding 14mm2', code: 'B712' },
                    { label: '50mm2 Earth Wire', code: 'B815' },
                    { label: '60mm2 AAC', code: 'C113' },
                    { label: 'Copper Lug 16mm2', code: 'G332' },
                    { label: 'Copper Lug 50mm2', code: 'G354' },
                    { label: 'C/T Lug 2.5mm2', code: 'G360' },
                    { label: 'Bimetallic Lug 35mm2', code: 'G373A' },
                    { label: 'Bimetallic Lug 50mm2', code: 'G374' },
                  ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="text-sm text-gray-600">{item.code}</span>
                      <input
                        type="checkbox"
                        checked={form[`material_${item.code}`] || false}
                        onChange={(e) => handleChange(`material_${item.code}`, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Back, Save/Edit Buttons --- */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          <button
            className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700"
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

const TextAreaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
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
