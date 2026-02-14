import React, { useState } from 'react';
import apiClient from '../utils/apiClient';

const Goals = ['Weight loss', 'Weight gain', 'Muscle gain', 'Diabetes control', 'PCOS management', 'Heart health', 'General fitness'];
const Diets = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto', 'Low-carb', 'High-protein'];
const Activity = ['Sedentary', 'Moderate', 'Active'];

export default function CreatePlanModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ goal: Goals[0], dietType: Diets[0], allergies: [], activity: Activity[1], calories: '', mealsPerDay: 3 });

  const toggleAllergy = (a) => {
    setForm(prev => {
      const set = new Set(prev.allergies);
      if (set.has(a)) set.delete(a); else set.add(a);
      return { ...prev, allergies: Array.from(set) };
    });
  };

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        goal: form.goal,
        dietType: form.dietType,
        allergies: form.allergies,
        activityLevel: form.activity,
        dailyCalorieTarget: form.calories ? Number(form.calories) : undefined,
        mealsPerDay: form.mealsPerDay,
        preferences: [],
      };

      const resp = await apiClient.post('/generate-plan', payload).catch(err => ({ data: null, error: err }));
      if (resp?.data?.plan) {
        const plan = resp.data.plan;
        // transform to { meta, days } for frontend components
        const days = (plan.week || []).map(d => ({ date: new Date(), meals: d.meals }));
        onCreate({ meta: plan.meta, days });
      } else {
        // fallback to local onCreate
        onCreate(form);
      }
    } catch (err) {
      console.error('Failed to generate plan', err);
      onCreate(form);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Create Plan</h3>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Primary Goal</span>
              <select className="border p-2 rounded" value={form.goal} onChange={e => setForm({...form, goal: e.target.value })}>
                {Goals.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Diet Type</span>
              <select className="border p-2 rounded" value={form.dietType} onChange={e => setForm({...form, dietType: e.target.value })}>
                {Diets.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Allergies (toggle)</div>
            <div className="flex gap-2 flex-wrap">
              {['nuts','dairy','gluten','soy','fish'].map(a => (
                <button type="button" key={a} onClick={() => toggleAllergy(a)} className={`px-3 py-1 border rounded ${form.allergies.includes(a) ? 'bg-gray-100' : ''}`}>{a}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Activity Level</span>
              <select className="border p-2 rounded" value={form.activity} onChange={e => setForm({...form, activity: e.target.value })}>
                {Activity.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Daily Calories (optional)</span>
              <input className="border p-2 rounded" value={form.calories} onChange={e => setForm({...form, calories: e.target.value })} />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Meals per day</span>
              <input type="number" min={1} max={8} className="border p-2 rounded" value={form.mealsPerDay} onChange={e => setForm({...form, mealsPerDay: parseInt(e.target.value) })} />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
