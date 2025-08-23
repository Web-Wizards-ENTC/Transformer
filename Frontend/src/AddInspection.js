import React, { useState } from "react";
import { addInspection } from "./API";

export default function AddInspectionModal({ open, setOpen }) {
  const [form, setForm] = useState({
    branch: "",
    transformerNo: "",
    date: "",
    time: ""
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    async function submit() {
      try {
        await addInspection(form);
        // Optionally show success message or update UI
      } catch (error) {
        // Optionally show error message
        console.error(error);
      } finally {
        setOpen(false);
      }
    }
    submit();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">New Inspection</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Branch */}
              <input
                type="text"
                className="w-full border rounded p-2"
                placeholder="Branch"
                value={form.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
              />

              {/* Transformer No */}
              <input
                type="text"
                className="w-full border rounded p-2"
                placeholder="Transformer No"
                value={form.transformerNo}
                onChange={(e) => handleChange("transformerNo", e.target.value)}
              />

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
                <input
                  type="time"
                  className="w-full border rounded p-2"
                  value={form.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                />
              </div>
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
