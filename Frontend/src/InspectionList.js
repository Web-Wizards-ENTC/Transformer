

import React, { useState } from 'react';
import AddInspectionModal from './AddInspection';
import './App.css';

import { getInspections } from './API';

const statusColors = {
  'In Progress': 'bg-green-100 text-green-700',
  'Pending': 'bg-red-100 text-red-700',
  'Completed': 'bg-purple-100 text-purple-700',
};

function InspectionList(props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  // Fetch inspection data from backend
  const fetchInspections = async () => {
    setLoading(true);
    try {
      const data = await getInspections();
      setInspections(data);
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    fetchInspections();
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = inspections.filter(t => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      t.transformerNo?.toLowerCase().includes(s) ||
      t.inspectionNo?.toLowerCase().includes(s) ||
      t.inspected?.toLowerCase().includes(s) ||
      t.maintenance?.toLowerCase().includes(s) ||
      t.status?.toLowerCase().includes(s)
    );
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
  <AddInspectionModal open={modalOpen} setOpen={setModalOpen} onAdded={fetchInspections} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Inspections</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
          onClick={() => setModalOpen(true)}
        >
          Add Inspection
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search Transformer"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button onClick={() => setSearch('')} className="text-indigo-600">Reset Filters</button>
        <div className="ml-auto flex gap-2">
          <button
            className={`px-4 py-2 rounded ${props.page === 'transformers' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-white text-indigo-700 border'}`}
            onClick={() => props.setPage('transformers')}
          >
            Transformers
          </button>
          <button
            className={`px-4 py-2 rounded ${props.page === 'inspections' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-white text-indigo-700 border'}`}
            onClick={() => props.setPage('inspections')}
          >
            Inspections
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading inspections...</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-indigo-100 text-indigo-700">
              <th className="py-2 px-4 text-left">Transformer No.</th>
              <th className="py-2 px-4 text-left">Inspection No.</th>
              <th className="py-2 px-4 text-left">Inspection Date & Time</th>
              <th className="py-2 px-4 text-left">Maintenance Date</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((t, i) => (
              <tr key={t.transformerNo + '-' + t.id} className="border-b hover:bg-indigo-50">
                <td className="py-2 px-4">{t.transformerNo}</td>
                <td className="py-2 px-4">{String(t.id).padStart(6, '0')}</td>
                <td className="py-2 px-4">{t.date} {t.time}</td>
                <td className="py-2 px-4">{t.maintainanceDate}</td>
                <td className="py-2 px-4">
                  <span
                    className={`inline-block min-w-[100px] px-3 py-1 rounded-lg font-semibold text-center shadow-sm ${statusColors[t.status] || ''}`}
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="py-2 px-4 text-right">
                  <button
                    className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}
            onClick={() => setPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default InspectionList;


