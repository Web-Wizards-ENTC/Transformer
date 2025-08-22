import React, { useState } from 'react';
import AddInspectionModal from './AddInspection';
import './App.css';

const inspectionData = [
  { no: 'AZ-8890', inspectionNo: '000123589', inspected: '02 Jul, 2025 19:12', maintenance: '-', status: 'In Progress' },
  { no: 'AZ-1649', inspectionNo: '000123589', inspected: '01 Jul, 2025 18:22', maintenance: '-', status: 'In Progress' },
  { no: 'AY-7316', inspectionNo: '000123589', inspected: '13 Jun, 2025 12:12', maintenance: '-', status: 'Pending' },
  { no: 'AZ-4613', inspectionNo: '000123589', inspected: '06 Jun, 2025 16:23', maintenance: '08 Jul, 2025 19:12', status: 'Completed' },
  { no: 'AX-8993', inspectionNo: '000123589', inspected: '02 Jul, 2025 19:12', maintenance: '08 Jul, 2025 19:12', status: 'Completed' },
  { no: 'AY-8790', inspectionNo: '000123589', inspected: '02 Jul, 2025 19:12', maintenance: '-', status: 'Pending' },
  { no: 'AZ-4563', inspectionNo: '000123589', inspected: '02 Jul, 2025 19:12', maintenance: '08 Jul, 2025 19:12', status: 'Completed' },
  { no: 'AZ-8523', inspectionNo: '000123589', inspected: '02 Jul, 2025 19:12', maintenance: '-', status: 'In Progress' },
  { no: 'AZ-8456', inspectionNo: '000123589', inspected: '02 Jul, 2025 19:12', maintenance: '08 Jul, 2025 19:12', status: 'Completed' },
  { no: 'AZ-7896', inspectionNo: '000123589', inspected: '02 Jul, 2025 19:12', maintenance: '08 Jul, 2025 19:12', status: 'Completed' },
  { no: 'AX-8990', inspectionNo: '000123589', inspected: '25 Apr, 2025 10:12', maintenance: '08 Jul, 2025 19:12', status: 'Completed' },
  { no: 'AY-6505', inspectionNo: '000123590', inspected: '10 Jul, 2025 11:00', maintenance: '-', status: 'Pending' },
  { no: 'AZ-6002', inspectionNo: '000123591', inspected: '11 Jul, 2025 12:30', maintenance: '-', status: 'In Progress' },
  { no: 'AZ-9403', inspectionNo: '000123592', inspected: '12 Jul, 2025 13:45', maintenance: '15 Jul, 2025 10:00', status: 'Completed' },
  { no: 'AX-6004', inspectionNo: '000123593', inspected: '13 Jul, 2025 14:15', maintenance: '16 Jul, 2025 11:30', status: 'Completed' },
  { no: 'AX-1005', inspectionNo: '000123594', inspected: '14 Jul, 2025 15:00', maintenance: '-', status: 'Pending' },
  { no: 'AZ-4336', inspectionNo: '000123595', inspected: '15 Jul, 2025 16:20', maintenance: '18 Jul, 2025 09:00', status: 'Completed' },
  { no: 'AY-9507', inspectionNo: '000123596', inspected: '16 Jul, 2025 17:10', maintenance: '19 Jul, 2025 13:00', status: 'Completed' },
  { no: 'AZ-9408', inspectionNo: '000123597', inspected: '17 Jul, 2025 18:00', maintenance: '-', status: 'In Progress' },
  { no: 'AX-3209', inspectionNo: '000123598', inspected: '18 Jul, 2025 19:00', maintenance: '20 Jul, 2025 14:00', status: 'Completed' },
 
];

const statusColors = {
  'In Progress': 'bg-green-100 text-green-700',
  'Pending': 'bg-red-100 text-red-700',
  'Completed': 'bg-purple-100 text-purple-700',
};

function InspectionList(props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 10;

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = inspectionData.filter(t => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      t.no.toLowerCase().includes(s) ||
      t.inspectionNo.toLowerCase().includes(s) ||
      t.inspected.toLowerCase().includes(s) ||
      t.maintenance.toLowerCase().includes(s) ||
      t.status.toLowerCase().includes(s)
    );
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <AddInspectionModal open={modalOpen} setOpen={setModalOpen} />
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
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-indigo-100 text-indigo-700">
            <th className="py-2 px-4 text-left">Transformer No.</th>
            <th className="py-2 px-4 text-left">Inspection No</th>
            <th className="py-2 px-4 text-left">Inspected Date</th>
            <th className="py-2 px-4 text-left">Maintenance Date</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((t, i) => (
            <tr key={t.no + t.inspectionNo} className="border-b hover:bg-indigo-50">
              <td className="py-2 px-4">{t.no}</td>
              <td className="py-2 px-4">{t.inspectionNo}</td>
              <td className="py-2 px-4">{t.inspected}</td>
              <td className="py-2 px-4">{t.maintenance}</td>
              <td className="py-2 px-4">
                <span className={`px-3 py-1 rounded ${statusColors[t.status]}`}>{t.status}</span>
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
