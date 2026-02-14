import React, { useState, useEffect } from 'react';

export default function EditMealModal({ open, meal, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', calories: 0 });

  useEffect(() => {
    if (meal) setForm({ name: meal.name || '', calories: meal.nutrition?.calories || 0 });
  }, [meal]);

  if (!open) return null;

  const save = (e) => {
    e.preventDefault();
    const updated = { ...meal, name: form.name, nutrition: { ...(meal.nutrition || {}), calories: Number(form.calories) } };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={save} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Meal</h3>
        <label className="block mb-3">
          <div className="text-sm text-gray-600 mb-1">Name</div>
          <input className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </label>
        <label className="block mb-3">
          <div className="text-sm text-gray-600 mb-1">Calories</div>
          <input type="number" className="w-full border p-2 rounded" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  );
}
