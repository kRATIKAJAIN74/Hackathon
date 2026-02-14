import React from 'react';

export default function MealCard({ meal }) {
  if (!meal) return null;
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
      <div>
        <div className="font-semibold">{meal.name}</div>
        <div className="text-xs text-gray-500">{(meal.tags || []).join(', ')}</div>
      </div>
      <div className="text-right">
        <div className="font-medium">{meal.nutrition?.calories || 0} kcal</div>
        <div className="text-xs text-gray-500">{meal.nutrition?.protein || 0}g P</div>
      </div>
    </div>
  );
}
