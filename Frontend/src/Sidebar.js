import React from 'react';
import { FaBolt, FaCog } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className="h-screen w-56 bg-white border-r flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-2">
        <img src="/webwizards.png" alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-lg tracking-wide">Web Wizards</span>
      </div>
      {/* Menu */}
      <div className="flex flex-col gap-6 w-full px-6">
        <button className="flex items-center gap-2 px-3 py-2 rounded bg-purple-50 text-purple-700 font-medium">
          <FaBolt className="text-base" />
          Transformer
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded text-gray-700 font-medium">
          <FaCog className="text-base" />
          Settings
        </button>
      </div>
    </div>
  );
}
