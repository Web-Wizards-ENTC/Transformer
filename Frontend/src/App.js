import React from 'react';
import AddTransformerModal from './AddTransformerModal';
import AddInspection from './AddInspection';

export default function App() {
  return (
    <>
      <div className="p-8">
        <AddTransformerModal />
      </div>
      <div className="p-8">
        <AddInspection />
      </div>
    </>
  );
}
