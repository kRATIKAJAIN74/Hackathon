import React from 'react';

export default function SummaryCard({ title, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-sm text-gray-500">{sub}</div>}
      </div>
    </div>
  );
}
