import React, { useState } from 'react';

export default function FindMealModal({ open, onClose, onFind }) {
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [goal, setGoal] = useState('weight loss');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dietType, setDietType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');
  const [region, setRegion] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      goal: goal || 'general',
      activityLevel: activityLevel || 'moderate',
      dietType: dietType || '',
      allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
      preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
      region: region || undefined,
    };
    onFind(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Find Meal</h3>
          <button className="text-gray-500" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option>weight loss</option>
              <option>muscle gain</option>
              <option>general</option>
              <option>diabetes</option>
              <option>pcos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Activity Level</label>
            <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="sedentary">sedentary</option>
              <option value="moderate">moderate</option>
              <option value="active">active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Diet Type (optional)</label>
            <input value={dietType} onChange={e => setDietType(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g. vegetarian, keto" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Allergies (comma separated)</label>
            <input value={allergies} onChange={e => setAllergies(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="peanut, dairy" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600">Preferences / Keywords (comma separated)</label>
            <input value={preferences} onChange={e => setPreferences(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="salad, oats, chicken" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600">Region / Cuisine (optional)</label>
            <input value={region} onChange={e => setRegion(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g. indian, mediterranean" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Find</button>
          </div>
        </form>
      </div>
    </div>
  );
}
