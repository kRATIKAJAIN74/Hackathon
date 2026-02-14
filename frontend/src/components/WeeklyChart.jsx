import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyChart({ data }) {
  const sample = data || [
    { day: 'Mon', calories: 1800 },
    { day: 'Tue', calories: 1900 },
    { day: 'Wed', calories: 2000 },
    { day: 'Thu', calories: 1850 },
    { day: 'Fri', calories: 2100 },
    { day: 'Sat', calories: 2200 },
    { day: 'Sun', calories: 1950 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="text-sm text-gray-500 mb-2">Weekly Calories</div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={sample}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="calories" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
