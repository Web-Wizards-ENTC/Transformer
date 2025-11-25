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

export default function App() {
  const [page, setPage] = useState('transformers');
  const [selectedTransformer, setSelectedTransformer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
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
          {page === 'inspections' && <InspectionList page={page} setPage={setPage} />}
          {page === 'thermal-analysis' && <ThermalAnalysis userName={userName} />}
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