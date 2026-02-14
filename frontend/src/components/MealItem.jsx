import React from 'react';

export default function MealItem({ meal, onToggle, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <input type="checkbox" className="w-4 h-4" checked={meal.completed || false} onChange={() => onToggle(meal)} />
        <div>
          <div className={`font-medium ${meal.completed ? 'line-through text-gray-400' : ''}`}>{meal.name}</div>
          <div className="text-xs text-gray-500">{meal.tags?.join(', ')}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold">{meal.nutrition?.calories} kcal</div>
        <button onClick={() => onEdit(meal)} className="text-sm text-blue-600 hover:underline">Edit</button>
        <button onClick={() => onDelete(meal)} className="text-sm text-red-500 hover:underline">Delete</button>
      </div>
    </div>
  );
}
