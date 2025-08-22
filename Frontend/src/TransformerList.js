import React, { useState } from 'react';
import AddTransformerModal from './AddTransformerModal';
import './App.css';

const transformerData = [
  { no: 'AZ-8890', pole: 'EN-122-A', region: 'Nugegoda', type: 'Bulk' },
  { no: 'AZ-1649', pole: 'EN-122-A', region: 'Nugegoda', type: 'Bulk' },
  { no: 'AZ-7316', pole: 'EN-123-B', region: 'Nugegoda', type: 'Bulk' },
  { no: 'AZ-4613', pole: 'EN-122-A', region: 'Nugegoda', type: 'Bulk' },
  { no: 'AX-8993', pole: 'EN-123-A', region: 'Nugegoda', type: 'Distribution' },
  { no: 'AY-8790', pole: 'EN-122-A', region: 'Nugegoda', type: 'Distribution' },
  { no: 'AZ-4563', pole: 'EN-123-A', region: 'Maharagama', type: 'Bulk' },
  { no: 'AZ-8523', pole: 'EN-123-A', region: 'Maharagama', type: 'Bulk' },
  { no: 'AZ-8456', pole: 'EN-123-A', region: 'Maharagama', type: 'Bulk' },
  { no: 'AZ-7896', pole: 'EN-123-A', region: 'Maharagama', type: 'Bulk' },
  { no: 'AX-8990', pole: 'EN-123-A', region: 'Maharagama', type: 'Distribution' },
  { no: 'AY-7701', pole: 'EN-124-A', region: 'Nugegoda', type: 'Bulk' },
  { no: 'AZ-9052', pole: 'EN-124-B', region: 'Nugegoda', type: 'Bulk' },
  { no: 'AZ-9063', pole: 'EN-125-A', region: 'Maharagama', type: 'Distribution' },
  { no: 'AX-6004', pole: 'EN-125-B', region: 'Maharagama', type: 'Bulk' },
  { no: 'AY-8405', pole: 'EN-126-A', region: 'Nugegoda', type: 'Distribution' },
  { no: 'AZ-9006', pole: 'EN-126-B', region: 'Maharagama', type: 'Bulk' },
  { no: 'AX-7007', pole: 'EN-127-A', region: 'Nugegoda', type: 'Bulk' },
  { no: 'AZ-9608', pole: 'EN-127-B', region: 'Maharagama', type: 'Distribution' },
  { no: 'AY-8069', pole: 'EN-128-A', region: 'Nugegoda', type: 'Bulk' },
];

const regions = ['All Regions', ...Array.from(new Set(transformerData.map(t => t.region)))];
const types = ['All Types', ...Array.from(new Set(transformerData.map(t => t.type)))];

function TransformerList(props) {
  const [region, setRegion] = useState('All Regions');
  const [type, setType] = useState('All Types');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Reset page to 1 when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [region, type, search]);

  // Filtering logic
  let filtered = transformerData;
  if (region !== 'All Regions') {
    filtered = filtered.filter(t => t.region === region);
  }
  if (type !== 'All Types') {
    filtered = filtered.filter(t => t.type === type);
  }
  if (search.trim() !== '') {
    const s = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.no.toLowerCase().includes(s) || t.pole.toLowerCase().includes(s)
    );
  }

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <AddTransformerModal open={modalOpen} setOpen={setModalOpen} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transformers</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
          onClick={() => setModalOpen(true)}
        >
          Add Transformer
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select value={region} onChange={e => setRegion(e.target.value)} className="border rounded px-2 py-1">
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search by Transformer No. or Pole No."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button onClick={() => { setRegion('All Regions'); setType('All Types'); setSearch(''); setPage(1); }} className="text-indigo-600">Reset Filters</button>
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
            <th className="py-2 px-4 text-left">Pole No.</th>
            <th className="py-2 px-4 text-left">Region</th>
            <th className="py-2 px-4 text-left">Type</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((t, i) => (
            <tr key={t.no} className="border-b hover:bg-indigo-50">
              <td className="py-2 px-4">{t.no}</td>
              <td className="py-2 px-4">{t.pole}</td>
              <td className="py-2 px-4">{t.region}</td>
              <td className="py-2 px-4">{t.type}</td>
              <td className="py-2 px-4 text-right">
                <button className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">View</button>
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
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TransformerList;
