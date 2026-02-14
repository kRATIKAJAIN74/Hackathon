import React from 'react';
import MealItem from './MealItem';

export default function PlanTodo({ plan, onToggle, onEdit, onDelete }) {
  if (!plan) return null;

  const today = plan.days?.[0];
  if (!today) return <div className="text-gray-500">No plan available</div>;

  const sections = ['breakfast', 'lunch', 'dinner', 'snacks'];

  return (
    <div className="space-y-4">
      {sections.map(sec => (
        <div key={sec} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold capitalize">{sec}</h3>
            <div className="text-sm text-gray-500">{today.meals[sec]?.length || 0} items</div>
          </div>
          <div className="space-y-2">
            {(today.meals[sec] || []).map(m => (
              <MealItem key={m.id || m.name} meal={m} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
