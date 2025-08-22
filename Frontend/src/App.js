import React from 'react';
import Sidebar from './Sidebar';
import UpperBar from './UpperBar';
import AddTransformerModal from './AddTransformerModal';
import AddInspection from './AddInspection';
import TransformerList from './TransformerList';
import InspectionList from './InspectionList';
import './App.css';

export default function App() {
  const [page, setPage] = React.useState('transformers');
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 max-h-screen overflow-auto">
        <UpperBar />
        <div className="p-8">
          {page === 'transformers' && (
            <>
              <AddTransformerModal />
              <TransformerList page={page} setPage={setPage} />
            </>
          )}
          {page === 'inspections' && (
            <>
              <AddInspection />
              <InspectionList page={page} setPage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
