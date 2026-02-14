import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, children }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded-md hover:bg-gray-100 ${active ? 'bg-gray-100 font-semibold' : ''}`}
    >
      {children}
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 fixed left-0 top-0 hidden md:block">
      <div className="mb-8">
        <div className="text-2xl font-bold">Foodoscope</div>
        <div className="text-sm text-gray-500">Diet Planner</div>
      </div>

      <nav className="space-y-2">
        <NavItem to="/dashboard">Dashboard</NavItem>
        <NavItem to="/plan/create">Create Plan</NavItem>
        <NavItem to="/plans">My Plans</NavItem>
        <NavItem to="/progress">Progress</NavItem>
        <NavItem to="/settings">Settings</NavItem>
      </nav>
    </aside>
  );
}
