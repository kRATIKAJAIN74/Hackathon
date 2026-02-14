import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import SummaryCard from '../components/SummaryCard';
import WeeklyChart from '../components/WeeklyChart';
import PlanTodo from '../components/PlanTodo';
import CreatePlanModal from '../components/CreatePlanModal';
import EditMealModal from '../components/EditMealModal';

const dummyUser = { name: 'Jessica', primaryGoal: 'Weight loss' };

const dummyPlan = {
  meta: { dailyCalorieTarget: 2000 },
  days: [
    {
      date: new Date(),
      meals: {
        breakfast: [{ id: 'r1', name: 'Oats Porridge with Berries', nutrition: { calories: 320 }, tags: ['vegetarian'] }],
        lunch: [{ id: 'r3', name: 'Grilled Chicken Salad', nutrition: { calories: 360 }, tags: ['low-carb'] }],
        dinner: [{ id: 'r11', name: 'Salmon with Quinoa', nutrition: { calories: 520 }, tags: ['high-protein'] }],
        snacks: [{ id: 'r12', name: 'Energy Balls', nutrition: { calories: 200 }, tags: ['snack'] }],
      },
    },
  ],
};

export default function Dashboard() {
  const [user] = useState(dummyUser);
  const [plan, setPlan] = useState(dummyPlan);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    // could fetch plan from API here
  }, []);

  const handleCreate = (profile) => {
    // For now simulate generate by adjusting dummyPlan
    const generated = { ...dummyPlan };
    generated.meta.dailyCalorieTarget = profile.calories || 2000;
    setPlan(generated);
  };

  const onToggle = (meal) => { console.log('toggle', meal); };
  const onEdit = (meal) => { console.log('edit', meal); };
  const onDelete = (meal) => { console.log('delete', meal); };

  // toggle completed flag for a meal in today's plan
  const toggleMeal = (meal) => {
    setPlan(prev => {
      const p = JSON.parse(JSON.stringify(prev));
      const today = p.days[0];
      ['breakfast','lunch','dinner','snacks'].forEach(sec => {
        today.meals[sec] = (today.meals[sec] || []).map(m => m.id === meal.id ? {...m, completed: !m.completed} : m);
      });
      return p;
    });
  };

  const editMeal = (meal) => {
    setEditingMeal(meal);
    setEditModalOpen(true);
  };

  const saveMeal = (updated) => {
    setPlan(prev => {
      const p = JSON.parse(JSON.stringify(prev));
      const today = p.days[0];
      ['breakfast','lunch','dinner','snacks'].forEach(sec => {
        today.meals[sec] = (today.meals[sec] || []).map(m => m.id === updated.id ? updated : m);
      });
      return p;
    });
  };

  const deleteMeal = (meal) => {
    setPlan(prev => {
      const p = JSON.parse(JSON.stringify(prev));
      const today = p.days[0];
      ['breakfast','lunch','dinner','snacks'].forEach(sec => {
        today.meals[sec] = (today.meals[sec] || []).filter(m => m.id !== meal.id);
      });
      return p;
    });
  };

  const regeneratePlan = () => {
    // For demo: rotate meals one day forward (simple change)
    setPlan(prev => {
      const p = JSON.parse(JSON.stringify(prev));
      p.days.unshift(p.days.pop());
      return p;
    });
  };

  const downloadPlan = () => {
    const data = JSON.stringify(plan, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar user={user} />

        <main className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Welcome back,</div>
                  <div className="text-2xl font-bold">{user.name}</div>
                  <div className="text-sm text-gray-500">Primary goal: {user.primaryGoal}</div>
                </div>
                <div>
                  <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create Plan</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-1">
              <SummaryCard title="Today's Calories" value="1,450" sub="/ 2,000 kcal" />
              <SummaryCard title="Protein" value="86g" sub="/ 120g" />
              <SummaryCard title="Carbs" value="180g" sub="/ 250g" />
              <SummaryCard title="Fat" value="60g" sub="/ 70g" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WeeklyChart />
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">Current Diet Plan</div>
                    <div className="flex items-center gap-2">
                      <button onClick={regeneratePlan} className="px-3 py-1 bg-white rounded shadow">Regenerate</button>
                      <button onClick={downloadPlan} className="px-3 py-1 bg-white rounded shadow">Download</button>
                    </div>
                  </div>
                  <PlanTodo plan={plan} onToggle={toggleMeal} onEdit={editMeal} onDelete={deleteMeal} />
                </div>
            </div>

            <aside className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">Quick Actions</div>
              <div className="bg-white rounded-lg shadow-sm p-4">Recent History</div>
            </aside>
          </div>
        </main>
      </div>

      <CreatePlanModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
      <EditMealModal open={editModalOpen} meal={editingMeal} onClose={() => setEditModalOpen(false)} onSave={saveMeal} />
    </div>
  );
}
