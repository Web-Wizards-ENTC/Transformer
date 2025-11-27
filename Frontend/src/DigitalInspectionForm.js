import React, { useState, useEffect } from "react";
// Assuming you have an API function to fetch detailed transformer data
import { getTransformers } from "./API"; 
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
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Maintenance Record</h2>
            <p className="text-gray-600">Maintenance record content will be displayed here.</p>
          </div>
        )}

        {activeTab === 'workdata' && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Work - Data Sheet</h2>
            <p className="text-gray-600">Work data sheet content will be displayed here.</p>
          </div>
        )}

        {/* --- Save/Edit Buttons [cite: 118, 119] --- */}
        <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            onClick={onCancel} // Cancel or Edit
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