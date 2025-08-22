import React from 'react';
import Sidebar from './Sidebar';
import AddTransformerModal from './AddTransformerModal';
import AddInspection from './AddInspection';
import TransformerList from './TransformerList';
import InspectionList from './InspectionList';
import './App.css';

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
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
      </div>
    </div>
  );
}
