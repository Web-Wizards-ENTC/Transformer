import React from 'react';
import Sidebar from './Sidebar';
import UpperBar from './UpperBar';
import TransformerList from './TransformerList';
import InspectionList from './InspectionList';
import TransformerInspectionDetails from './TransformerInspectionDetails';
import './App.css';

export default function App() {
  const [page, setPage] = React.useState('transformers');
  const [selectedTransformer, setSelectedTransformer] = React.useState(null);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 max-h-screen overflow-auto">
        <UpperBar />
        <div className="p-8">
          {page === 'transformers' && (
            <TransformerList 
              page={page} 
              setPage={setPage}
              setSelectedTransformer={setSelectedTransformer}
            />
          )}

          {page === 'inspections' && (
            <InspectionList 
              page={page} 
              setPage={setPage} 
            />
          )}

          {page === 'inspectionDetails' && selectedTransformer && (
            <TransformerInspectionDetails 
              transformer={selectedTransformer}
              onBack={() => setPage('transformers')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

