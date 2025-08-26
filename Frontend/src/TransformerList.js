import React, { useState } from 'react';
import AddTransformerModal from './AddTransformerModal';
import './App.css';

// Load transformer data from JSON file
import { getTransformers } from './API';




function TransformerList(props) {
  const [region, setRegion] = useState('All Regions');
  const [type, setType] = useState('All Types');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  // Fetch transformer data from backend
  const fetchTransformers = async () => {
    setLoading(true);
    try {
      const data = await getTransformers();
      setTransformers(data);
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    fetchTransformers();
  }, []);

  const regions = ['All Regions', ...Array.from(new Set(transformers.map(t => t.region)))];
  const types = ['All Types', ...Array.from(new Set(transformers.map(t => t.type)))];


  // Sort by last added time (newest first)
  let filtered = [...transformers];
  filtered.sort((a, b) => {
    // If createdAt exists, sort by it; otherwise, sort by array order
    if (b.createdAt && a.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });
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

  // Reset page to 1 when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [region, type, search]);

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <AddTransformerModal open={modalOpen} setOpen={setModalOpen} onAdded={fetchTransformers} />
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
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading transformers...</div>
      ) : (
        <>
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
                  <td className="py-2 px-4">{t.transformerNo}</td>
                  <td className="py-2 px-4">{t.poleNo}</td>
                  <td className="py-2 px-4">{t.region}</td>
                  <td className="py-2 px-4">{t.type}</td>
                  <td className="py-2 px-4 text-right">
                    <button 
                      className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                      onClick={() => {
                        props.setSelectedTransformer(t); // Pass the row transformer
                        props.setPage('inspectionDetails'); // Go to details page
                      }}
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
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TransformerList;
