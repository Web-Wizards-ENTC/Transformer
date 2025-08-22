import React from 'react';
import { FaBars, FaBell } from 'react-icons/fa';

export default function UpperBar() {
  return (
  <div className="flex items-center justify-between px-8 py-4 bg-white border-b sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <FaBars className="text-2xl text-gray-700" />
        <span className="font-bold text-xl text-gray-900">Transformer</span>
      </div>
      <div className="flex items-center gap-4">
        <FaBell className="text-xl text-gray-700" />
        <div className="flex items-center gap-2">
          <img src="/lasitha profile.jpg" alt="User" className="w-8 h-8 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Lasitha</span>
            <span className="text-xs font-semibold text-gray-600">Amarasinghe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
