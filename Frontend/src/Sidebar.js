import React from 'react';
import { FaBolt, FaCog, FaThermometerHalf } from 'react-icons/fa';

export default function Sidebar({ currentPage, setPage }) {
  const menuItems = [
    {
      id: 'transformers',
      label: 'Transformer',
      icon: FaBolt,
    },
    {
      id: 'thermal-analysis',
      label: 'Thermal Analysis',
      icon: FaThermometerHalf,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FaCog,
    },
  ];

  return (
    <div className="h-screen w-56 bg-white border-r flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-2">
        <img src="/webwizards.png" alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-lg tracking-wide">Web Wizards</span>
      </div>
      
      {/* Menu */}
      <div className="flex flex-col gap-6 w-full px-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setPage && setPage(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="text-base" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
