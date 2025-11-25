import React, { useState } from 'react';
import { FaBars, FaBell } from 'react-icons/fa';

export default function UpperBar({ userName }) {
  const [showNotification, setShowNotification] = useState(false);

  const nameParts = userName ? userName.split(' ') : ['User', 'Name'];
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const handleNotificationClick = () => {
    // Show the notification window
    setShowNotification(true);

    // Hide the notification window after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      {/* Left side: Navigation and Page Title */}
      <div className="flex items-center gap-4">
        <button className="text-gray-700 hover:text-blue-600 transition-colors">
          <FaBars className="text-2xl" />
        </button>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
      </div>

      {/* Right side: User and Notifications */}
      <div className="flex items-center gap-6">
        <div className="relative">
          {/* Clickable Bell Icon */}
          <button
            onClick={handleNotificationClick}
            className="relative text-gray-700 hover:text-blue-600 transition-colors"
          >
            <FaBell className="text-xl" />
          </button>
          
          {/* Notification Pop-up Window */}
          {showNotification && (
            <div className="absolute top-10 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-3 px-4 text-center z-50">
              <p className="text-sm text-gray-700 font-medium">No new notifications.</p>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <img src="/user.jpg" alt="User Profile" className="w-9 h-9 rounded-full object-cover border border-gray-300 shadow-sm" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">{firstName}</span>
            <span className="text-xs text-gray-600">{lastName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}