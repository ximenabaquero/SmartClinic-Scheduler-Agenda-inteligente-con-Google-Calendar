import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">SmartClinic Scheduler</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};