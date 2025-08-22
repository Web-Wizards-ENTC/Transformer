import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FaEye, FaTrash, FaEllipsisV, FaMapMarkerAlt } from 'react-icons/fa';

export default function TransformerInspectionDetails({ onBack }) {
  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded bg-indigo-700 flex items-center justify-center text-white">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div>
              <div className="font-semibold text-lg">AZ-8890</div>
              <div className="text-xs text-gray-500 flex items-center">
                Nugegoda 
                <FaMapMarkerAlt className="mx-1 text-red-500" /> 
                <span className="text-red-500">"Keels", Embuldeniya</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">EN-122-A</div>
              <div className="text-center text-gray-500 text-xs">Pole No</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">102.97</div>
              <div className="text-center text-gray-500 text-xs">Capacity</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">Bulk</div>
              <div className="text-center text-gray-500 text-xs">Type</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-1 rounded-md">
              <div className="text-center text-gray-800 font-medium">2</div>
              <div className="text-center text-gray-500 text-xs">No. of Feeders</div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-2">Last Inspected Date: Mon(21), May, 2023 12.55pm</div>
          <div className="flex gap-2 justify-end">
            <button className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1">
              <FaEye className="text-gray-600" />
              <span>Baseline Image</span>
            </button>
            <button className="bg-gray-50 border border-gray-200 w-7 h-7 rounded-md flex items-center justify-center">
              <FaTrash className="text-red-500 text-xs" />
            </button>
            <button className="bg-gray-50 border border-gray-200 w-7 h-7 rounded-md flex items-center justify-center">
              <FaEllipsisV className="text-indigo-700 text-xs" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transformer Inspections</h2>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Add Inspection</button>
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
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-b hover:bg-indigo-50">
                <td className="py-2 px-4 flex items-center gap-2">
                  {i === 0 ? <FaStar className="text-indigo-600" /> : <FaRegStar className="text-gray-400" />}
                  000123589
                </td>
                <td className="py-2 px-4">Mon(21), May, 2023 12.55pm</td>
                <td className="py-2 px-4">{i === 2 ? '-' : 'Mon(21), May, 2023 12.55pm'}</td>
                <td className="py-2 px-4">
                  {i === 2 ? (
                    <span className="px-3 py-1 rounded bg-red-100 text-red-700">Pending</span>
                  ) : i < 2 ? (
                    <span className="px-3 py-1 rounded bg-green-100 text-green-700">In Progress</span>
                  ) : (
                    <span className="px-3 py-1 rounded bg-purple-100 text-purple-700">Completed</span>
                  )}
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <button className="text-indigo-600" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
