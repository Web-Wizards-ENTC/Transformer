import React, { useState, useEffect } from "react";
// Assuming you have an API function to fetch detailed transformer data
import { getTransformers, addGeneralRecord, addMaintenanceRecord, addWorkDataSheet } from "./API"; 
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

// Import your local default image
import defaultImage from './assets/default-transformer.png';

export default function DigitalInspectionForm({ inspection, onSave, onCancel }) {
  const [transformer, setTransformer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    date: inspection.inspected || new Date().toISOString().split('T')[0],
    time: inspection.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    inspectorName: inspection.inspector || '',
    transformerStatus: inspection.status || 'OK',
    recommendedAction: '',
    additionalRemarks: '',
    voltageR: '', voltageY: '', voltageB: '',
    currentR: '', currentY: '', currentB: '',
    voltageR2: '', voltageY2: '', voltageB2: '',
    currentR2: '', currentY2: '', currentB2: '',
    startTime: '', completionTime: '', supervisedBy: '',
    techI: '', techII: '', techIII: '', helpers: '',
    inspectedBy: '', inspectedDate: '', rectifiedBy: '', rectifiedDate: '',
    reInspectedBy: '', reInspectedDate: '', css1: '', css1Date: '',
    allSpotsCorrect: false, css2: '', css2Date: '',
    gangLeader: '', workDate: '', jobStartedTime: '', serialNo: '', kva: '',
    make: '', tapPosition: '', txCtRation: '', manufactureYear: '',
    earthResistance: '', neutral: '', surgeOrBody: '',
    fdsF1: false, fdsF1A: '', fdsF2: false, fdsF2A: '',
    fdsF3: false, fdsF3A: '', fdsF4: false, fdsF4A: '', fdsF5: false, fdsF5A: '',
    jobCompletedTime: '', workNotes: '',
    materials: {
      copperWire16mm2: false, abcWire70mm2: false, aluminumBinding14mm2: false,
      earthWire50mm2: false, aac60mm2: false, copperLug16mm2: false,
      copperLug50mm2: false, ctLug25mm2: false, bimetallicLug35mm2: false,
      bimetallicLug50mm2: false,
    },
  });

  const [showPastForms, setShowPastForms] = useState(false);
  const [pastForms] = useState([
    { id: "p1", date: "2025-11-01", time: "09:12", inspector: "A-110" },
    { id: "p2", date: "2025-10-18", time: "14:05", inspector: "T-112" },
    { id: "p3", date: "2025-09-30", time: "08:45", inspector: "P-453" },
  ]);

  useEffect(() => {
    async function fetchTransformerDetails() {
      try {
        const allTransformers = await getTransformers();
        const foundTransformer = allTransformers.find(
          t => t.transformerNo === inspection.transformerNo || t.no === inspection.transformerNo
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
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (activeTab === "general") await addGeneralRecord(form);
      else if (activeTab === "maintenance") await addMaintenanceRecord(form);
      else if (activeTab === "workdata") await addWorkDataSheet(form);
      onSave();
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  const handleViewPastForms = () => setShowPastForms(true);
  const handleView = (row) => console.log("View row:", row);
  const handleDownload = async (row) => {
    try {
      // Fetch PDF from backend
      const response = await fetch("http://localhost:8080/api/pdf/generate/mock");
      
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inspection_${row.date}_${row.inspector}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading transformer details...</div>;

  const { region = 'N/A', transformerNo = inspection.transformerNo, poleNo = 'N/A', locationDetails = 'N/A' } = transformer || {};

  if (showPastForms) {
    return (
      <div className="p-8 font-sans bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Past Forms</h1>
              <p className="text-sm text-gray-600">Transformer: {transformerNo} • Pole: {poleNo} • Region: {region}</p>
            </div>
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowPastForms(false)}>Back to Form</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="px-6 py-3 text-sm font-semibold text-indigo-700">Date</th>
                  <th className="px-6 py-3 text-sm font-semibold text-indigo-700">Time</th>
                  <th className="px-6 py-3 text-sm font-semibold text-indigo-700">Inspector</th>
                  <th className="px-6 py-3 text-sm font-semibold text-indigo-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastForms.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="px-6 py-4 text-sm text-gray-700">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.inspector}</td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button className="inline-block px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => handleView(row)}>View</button>
                      <button className="inline-block px-4 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => handleDownload(row)}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Digital Inspection Form</h1>

        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-indigo-50 rounded-md">
          <DetailField label="Region" value={region} isReadOnly={true} />
          <DetailField label="Transformer No." value={transformerNo} isReadOnly={true} />
          <DetailField label="Pole No." value={poleNo} isReadOnly={true} />
          <DetailField label="Location Details" value={locationDetails} isReadOnly={true} />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-300 flex space-x-1">
          {['general','maintenance','workdata'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-all ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              {tab === 'general' ? '1. General Record' : tab === 'maintenance' ? '2. Maintenance Record' : '3. Work - Data Sheet'}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <InputField label="Date of Inspection" type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} icon={FaCalendarAlt} />
              <InputField label="Time" type="time" value={form.time} onChange={(e) => handleChange("time", e.target.value)} icon={FaClock} />
            </div>

            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Engineer Input Fields</h2>
            <div className="space-y-6">
              <InputField label="Inspected By (Name/ID)" placeholder="Engineer's Name or ID" value={form.inspectorName} onChange={(e) => handleChange("inspectorName", e.target.value)} />
              <SelectField label="Transformer Status" value={form.transformerStatus} onChange={(e) => handleChange("transformerStatus", e.target.value)} options={['OK','Needs Maintenance','Urgent Attention']} />
              <ReadingsSection title="First Inspection Voltage & Current Readings" form={form} handleChange={handleChange} prefix="First" />
              <ReadingsSection title="Second Inspection Voltage & Current Readings" form={form} handleChange={handleChange} prefix="Second" />
              <TextAreaField label="Recommended Action" value={form.recommendedAction} onChange={(e) => handleChange("recommendedAction", e.target.value)} placeholder="e.g., Tightening connections..." />
              <TextAreaField label="Additional Remarks" value={form.additionalRemarks} onChange={(e) => handleChange("additionalRemarks", e.target.value)} placeholder="Any other notes or observations." />
            </div>

            {/* Baseline Image */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Baseline Image</h2>
              <div className="h-40 w-full border border-dashed border-gray-400 flex items-center justify-center rounded overflow-hidden">
                <img
                  src={transformer?.imageUrl || defaultImage}
                  alt="Baseline Transformer"
                  className="object-contain h-full w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Record Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Start Time" type="time" value={form.startTime} onChange={(e) => handleChange('startTime', e.target.value)} icon={FaClock} />
              <InputField label="Completion Time" type="time" value={form.completionTime} onChange={(e) => handleChange('completionTime', e.target.value)} icon={FaClock} />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Personnel</h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Supervised By" value={form.supervisedBy} onChange={(e) => handleChange('supervisedBy', e.target.value)} placeholder="Enter supervisor name" />
                <InputField label="Tech I" value={form.techI} onChange={(e) => handleChange('techI', e.target.value)} placeholder="Enter Tech I name" />
                <InputField label="Tech II" value={form.techII} onChange={(e) => handleChange('techII', e.target.value)} placeholder="Enter Tech II name" />
                <InputField label="Tech III" value={form.techIII} onChange={(e) => handleChange('techIII', e.target.value)} placeholder="Enter Tech III name" />
                <div className="col-span-2">
                  <InputField label="Helpers" value={form.helpers} onChange={(e) => handleChange('helpers', e.target.value)} placeholder="Enter helpers' names" />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Inspection & Rectification</h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Inspected By" value={form.inspectedBy} onChange={(e) => handleChange('inspectedBy', e.target.value)} placeholder="Enter inspector name" />
                <InputField label="Inspected Date" type="date" value={form.inspectedDate} onChange={(e) => handleChange('inspectedDate', e.target.value)} icon={FaCalendarAlt} />
                <InputField label="Rectified By" value={form.rectifiedBy} onChange={(e) => handleChange('rectifiedBy', e.target.value)} placeholder="Enter rectifier name" />
                <InputField label="Rectified Date" type="date" value={form.rectifiedDate} onChange={(e) => handleChange('rectifiedDate', e.target.value)} icon={FaCalendarAlt} />
                <InputField label="Re-Inspected By" value={form.reInspectedBy} onChange={(e) => handleChange('reInspectedBy', e.target.value)} placeholder="Enter re-inspector name" />
                <InputField label="Re-Inspected Date" type="date" value={form.reInspectedDate} onChange={(e) => handleChange('reInspectedDate', e.target.value)} icon={FaCalendarAlt} />
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">CSS Verification</h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="CSS 1" value={form.css1} onChange={(e) => handleChange('css1', e.target.value)} placeholder="Enter CSS 1 verifier" />
                <InputField label="CSS 1 Date" type="date" value={form.css1Date} onChange={(e) => handleChange('css1Date', e.target.value)} icon={FaCalendarAlt} />
                
                <div className="col-span-2 flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-300">
                  <input 
                    type="checkbox" 
                    id="allSpotsCorrect"
                    checked={form.allSpotsCorrect || false}
                    onChange={(e) => handleChange('allSpotsCorrect', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="allSpotsCorrect" className="text-sm font-medium text-gray-700 cursor-pointer">
                    All spots were found to be correct
                  </label>
                </div>

                <InputField label="CSS 2" value={form.css2} onChange={(e) => handleChange('css2', e.target.value)} placeholder="Enter CSS 2 verifier" />
                <InputField label="CSS 2 Date" type="date" value={form.css2Date} onChange={(e) => handleChange('css2Date', e.target.value)} icon={FaCalendarAlt} />
              </div>
            </div>
          </div>
        )}

        {/* Work Data Sheet Tab */}
        {activeTab === 'workdata' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <SelectField 
                label="Gang Leader" 
                value={form.gangLeader} 
                onChange={(e) => handleChange('gangLeader', e.target.value)}
                options={['', 'P-453', 'P-454', 'P-455', 'P-456']}
              />
              <InputField label="Date" type="date" value={form.workDate} onChange={(e) => handleChange('workDate', e.target.value)} icon={FaCalendarAlt} />
              <InputField label="Job Started Time" type="time" value={form.jobStartedTime} onChange={(e) => handleChange('jobStartedTime', e.target.value)} icon={FaClock} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InputField label="Serial No." value={form.serialNo} onChange={(e) => handleChange('serialNo', e.target.value)} placeholder="e.g., J-14-V016010026" />
              <SelectField 
                label="kVA" 
                value={form.kva} 
                onChange={(e) => handleChange('kva', e.target.value)}
                options={['', '50', '100', '160', '250', '315', '500', '630']}
              />
              <SelectField 
                label="Make" 
                value={form.make} 
                onChange={(e) => handleChange('make', e.target.value)}
                options={['', 'LTL', 'BEST', 'TOSHIBA', 'ABB']}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <SelectField 
                label="Tap Position" 
                value={form.tapPosition} 
                onChange={(e) => handleChange('tapPosition', e.target.value)}
                options={['', '1', '2', '3', '4', '5']}
              />
              <InputField label="Tx CT Ration" value={form.txCtRation} onChange={(e) => handleChange('txCtRation', e.target.value)} placeholder="e.g., 300/5A" />
              <InputField label="Manufacture Year" value={form.manufactureYear} onChange={(e) => handleChange('manufactureYear', e.target.value)} placeholder="e.g., 2014" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Earth Resistance</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.earthResistance || ''} 
                    onChange={(e) => handleChange('earthResistance', e.target.value)}
                    className="flex-1 border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="text-gray-600 font-medium">Ω</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Neutral</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.neutral || ''} 
                    onChange={(e) => handleChange('neutral', e.target.value)}
                    className="flex-1 border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="-"
                  />
                  <span className="text-gray-600 font-medium">Ω</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="surgeOrBody"
                  value="Surge"
                  checked={form.surgeOrBody === 'Surge'}
                  onChange={(e) => handleChange('surgeOrBody', e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Surge</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="surgeOrBody"
                  value="Body"
                  checked={form.surgeOrBody === 'Body'}
                  onChange={(e) => handleChange('surgeOrBody', e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Body</span>
              </label>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">FDS Fuse Ratings</h2>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">F{num}</label>
                    <input 
                      type="checkbox"
                      checked={form[`fdsF${num}`] || false}
                      onChange={(e) => handleChange(`fdsF${num}`, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <input 
                      type="number"
                      step="0.1"
                      value={form[`fdsF${num}A`] || ''}
                      onChange={(e) => handleChange(`fdsF${num}A`, e.target.value)}
                      placeholder="A"
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <InputField label="Job Completed Time" type="time" value={form.jobCompletedTime} onChange={(e) => handleChange('jobCompletedTime', e.target.value)} icon={FaClock} />

            <div className="border-t pt-6">
              <TextAreaField 
                label="Notes" 
                value={form.workNotes} 
                onChange={(e) => handleChange('workNotes', e.target.value)}
                placeholder="Detected minor overheating on the transformer's secondary winding during peak load hours..."
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Materials/Items Used</h2>
              <div className="space-y-2">
                {[
                  { name: '16mm2 Copper wire', code: 'B112' },
                  { name: '70mm2 ABC wire', code: 'B244' },
                  { name: 'Aluminum binding 14mm2', code: 'B712' },
                  { name: '50mm2 Earth Wire', code: 'B815' },
                  { name: '60mm2 AAC', code: 'C113' },
                  { name: 'Copper Lug 16mm2', code: 'G332' },
                  { name: 'Copper Lug 50mm2', code: 'G354' },
                  { name: 'C/T Lug 2.5mm2', code: 'G360' },
                  { name: 'Bimetallic Lug 35mm2', code: 'G373A' },
                  { name: 'Bimetallic Lug 50mm2', code: 'G374' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                    <span className="text-sm text-gray-600 w-20 text-center">{item.code}</span>
                    <input 
                      type="checkbox"
                      checked={form[`material_${item.code}`] || false}
                      onChange={(e) => handleChange(`material_${item.code}`, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 ml-4"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-4 mt-8 pt-4 border-t">
          <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700" onClick={onCancel}>Back</button>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300" onClick={onCancel}>Edit</button>
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={handleViewPastForms}>View Past Forms</button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper components remain the same ---
const DetailField = ({ label, value, isReadOnly }) => (
  <div className="flex flex-col">
    <label className="text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input type="text" value={value} readOnly={isReadOnly} className={`w-full border rounded p-2 text-sm ${isReadOnly ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-white border-gray-300'}`} />
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, icon: Icon }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full border border-gray-300 rounded p-2 pr-10 focus:ring-indigo-500 focus:border-indigo-500" />
      {Icon && <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
    </div>
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows="3" className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select value={value} onChange={onChange} className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500">
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

const ReadingsSection = ({ title, form, handleChange, prefix }) => (
  <div className="p-4 border rounded-lg bg-gray-50">
    <h3 className="font-semibold text-lg mb-3">{title}</h3>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Voltage (V)</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="R" className="border rounded p-2 text-sm" value={form[`voltageR${prefix==='Second'?'2':''}`]} onChange={(e)=>handleChange(`voltageR${prefix==='Second'?'2':''}`, e.target.value)} />
          <input type="number" placeholder="Y" className="border rounded p-2 text-sm" value={form[`voltageY${prefix==='Second'?'2':''}`]} onChange={(e)=>handleChange(`voltageY${prefix==='Second'?'2':''}`, e.target.value)} />
          <input type="number" placeholder="B" className="border rounded p-2 text-sm" value={form[`voltageB${prefix==='Second'?'2':''}`]} onChange={(e)=>handleChange(`voltageB${prefix==='Second'?'2':''}`, e.target.value)} />
        </div>
      </div>
      <div className="col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Current (A)</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="R" className="border rounded p-2 text-sm" value={form[`currentR${prefix==='Second'?'2':''}`]} onChange={(e)=>handleChange(`currentR${prefix==='Second'?'2':''}`, e.target.value)} />
          <input type="number" placeholder="Y" className="border rounded p-2 text-sm" value={form[`currentY${prefix==='Second'?'2':''}`]} onChange={(e)=>handleChange(`currentY${prefix==='Second'?'2':''}`, e.target.value)} />
          <input type="number" placeholder="B" className="border rounded p-2 text-sm" value={form[`currentB${prefix==='Second'?'2':''}`]} onChange={(e)=>handleChange(`currentB${prefix==='Second'?'2':''}`, e.target.value)} />
        </div>
      </div>
    </div>
  </div>
);
