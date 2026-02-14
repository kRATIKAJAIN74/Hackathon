import React from 'react';
import { FiBell, FiUser } from 'react-icons/fi';

export default function Topbar({ user }) {
  return (
    <div className="flex items-center justify-between bg-white p-4 border-b">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 bg-gray-100 rounded-md">☰</button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100"><FiBell size={18} /></button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><FiUser /></div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">{user?.name || 'Guest'}</div>
            <div className="text-xs text-gray-500">View profile</div>
          </div>
        </div>
      </div>
    </div>
  );
}
