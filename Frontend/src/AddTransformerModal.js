import React, { useState } from "react";

export default function AddTransformerModal({ open, setOpen }) {
  const [form, setForm] = useState({
    region: "",
    transformerNo: "",
    poleNo: "",
    type: "",
    locationDetails: ""
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    console.log("Form submitted:", form);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Add Transformer</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Regions */}
              <select
                className="w-full border rounded p-2"
                value={form.region}
                onChange={(e) => handleChange("region", e.target.value)}
              >
                <option value="">Region</option>
                <option value="colombo">Nugegoda</option>
                <option value="colombo-0">Maharagama</option>
                <option value="colombo-1">Kotuwa</option>
                <option value="colombo-2">Kompanyaweediya</option>
                <option value="colombo-3">Kollupitiya</option>
                <option value="colombo-4">Bambalapitiya</option>
                <option value="colombo-5">Havelock Town</option>
                <option value="colombo-6">Wellawatte</option>
                <option value="colombo-7">Kurunduwatte</option>
              </select>

              {/* Transformer No */}
              <input
                type="text"
                className="w-full border rounded p-2"
                placeholder="Transformer No"
                value={form.transformerNo}
                onChange={(e) => handleChange("transformerNo", e.target.value)}
              />

              {/* Pole No */}
              <input
                type="text"
                className="w-full border rounded p-2"
                placeholder="Pole No"
                value={form.poleNo}
                onChange={(e) => handleChange("poleNo", e.target.value)}
              />

              {/* Type */}
              <select
                className="w-full border rounded p-2"
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value="">Type</option>
                <option value="bulk">Bulk</option>
                <option value="distribution">Distribution</option>
              </select>

              {/* Location Details */}
              <input
                type="text"
                className="w-full border rounded p-2"
                placeholder="Location Details"
                value={form.locationDetails}
                onChange={(e) => handleChange("locationDetails", e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="text-gray-600 hover:underline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
