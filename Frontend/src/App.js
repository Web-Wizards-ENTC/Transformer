import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import UpperBar from './UpperBar';
import ThermalAnalysis from './ThermalAnalysis';
import TransformerList from './TransformerList';
import InspectionList from './InspectionList';
import TransformerInspectionDetails from './TransformerInspectionDetails';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import './App.css';
import DigitalInspectionForm from './DigitalInspectionForm';

export default function App() {
  const [page, setPage] = useState('transformers');
  const [selectedTransformer, setSelectedTransformer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [userName, setUserName] = useState(''); // New state for user name

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName');
    if (token && storedUserName) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
    }
  }, []);

  const handleLogin = (name) => {
    setIsLoggedIn(true);
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setPage('transformers');
    setSelectedTransformer(null);
  };

  const handleFormSaveOrCancel = () => { // <--- ADD THIS NEW FUNCTION
    // Navigate back to inspection details if a transformer is selected, otherwise to the main inspection list.
    if (selectedTransformer) {
      setPage('inspectionDetails');
    } else {
      setPage('inspections');
    }
    // Optionally clear the selected inspection after navigating back
    setSelectedInspection(null);
  }; // <--- END NEW FUNCTION

  if (!isLoggedIn) {
    if (showSignUp) {
      return <SignUpPage onSignInClick={() => setShowSignUp(false)} />;
    }
    return <LoginPage onLogin={handleLogin} onSignUpClick={() => setShowSignUp(true)} />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage={page} setPage={setPage} onLogout={handleLogout} />
      <div className="flex-1 max-h-screen overflow-auto">
        <UpperBar userName={userName} /> 
        <div className="p-8">
          {page === 'transformers' && (
            <TransformerList
              page={page}
              setPage={setPage}
              setSelectedTransformer={setSelectedTransformer}
            />
          )}
          {page === 'inspections' && <InspectionList page={page} setPage={setPage} setSelectedInspection={setSelectedInspection} />}
          {page === 'thermal-analysis' && <ThermalAnalysis userName={userName} />}
          {page === 'inspectionDetails' && selectedTransformer && (
            <TransformerInspectionDetails
              transformer={selectedTransformer}
              onBack={() => setPage('transformers')}
              setPage={setPage} // <--- PASS THIS PROP
              setSelectedInspection={setSelectedInspection}
            />
          )}
          {page === 'digitalForm' && selectedInspection && (
            <DigitalInspectionForm
              inspection={selectedInspection}
              onSave={handleFormSaveOrCancel}
              onCancel={handleFormSaveOrCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}