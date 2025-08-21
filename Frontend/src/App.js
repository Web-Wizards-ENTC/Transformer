import React from 'react';
import AddTransformerModal from './AddTransformerModal';
import AddInspection from './AddInspection';
import TransformerList from './TransformerList';
import InspectionList from './InspectionList';
import './App.css';

export default function App() {
  return (
    <>
      <div className="p-8">
        <AddTransformerModal />
      </div>
      <div className="p-8">
        <AddInspection />
      </div>
      <div className="p-8">
        <TransformerList />
        <InspectionList />
      </div>
    </>
  );
}
