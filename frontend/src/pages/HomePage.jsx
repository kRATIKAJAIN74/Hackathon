import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white/60 backdrop-blur rounded-2xl shadow-md p-6 hover:scale-105 transform transition">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-semibold text-lg mb-1">{title}</h3>
    <p className="text-sm text-gray-700">{desc}</p>
  </div>
);

const HomePage = () => {
  return (
    <Layout>
      <header className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-pink-500 p-12 md:p-20 rounded-b-3xl text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Foodoscope — Your Personalized Diet Planner</h1>
              <p className="text-lg md:text-xl text-indigo-100 mb-6">Automatically generate weekly meal plans that match your goals, respect allergies, and simplify healthy eating.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition">
                  Get Started — It’s Free
                </Link>
                <Link to="/dashboard" className="inline-block border border-white/40 text-white px-6 py-3 rounded-full hover:bg-white/10 transition">
                  See Dashboard Demo
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm opacity-90">
                <div className="bg-white/10 rounded-lg p-3 text-center">Smart Recipes</div>
                <div className="bg-white/10 rounded-lg p-3 text-center">Allergy Safe</div>
                <div className="bg-white/10 rounded-lg p-3 text-center">Calorie Targets</div>
                <div className="bg-white/10 rounded-lg p-3 text-center">Macro Balancing</div>
              </div>
            </div>

            <div className="order-first md:order-last flex justify-center md:justify-end">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl ring-1 ring-white/20">
                <div className="text-sm text-gray-500 mb-4">Preview — Today’s Plan</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Breakfast</div>
                      <div className="font-semibold">Oats Porridge with Berries</div>
                    </div>
                    <div className="text-sm font-medium">320 kcal</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Lunch</div>
                      <div className="font-semibold">Grilled Chicken Salad</div>
                    </div>
                    <div className="text-sm font-medium">360 kcal</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Dinner</div>
                      <div className="font-semibold">Salmon with Quinoa</div>
                    </div>
                    <div className="text-sm font-medium">520 kcal</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Snacks</div>
                      <div className="font-semibold">Energy Balls</div>
                    </div>
                    <div className="text-sm font-medium">200 kcal</div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Daily target</div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg">1400</div>
                      <div className="text-sm text-gray-500">/ 2000 kcal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative SVG waves */}
        <svg className="-mt-2 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,32 C200,120 400,0 720,48 C1040,96 1240,16 1440,64 L1440 0 L0 0 Z" fill="#ffffff" opacity="0.06"></path>
        </svg>
      </header>

      <main className="-mt-8 pb-16">
        <section className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-8">What you get with Foodoscope</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon="🎯" title="Goal-driven Plans" desc="Plans tailored to weight, muscle, diabetes control and more." />
            <FeatureCard icon="🛡️" title="Allergy & Diet Safe" desc="Automatically filters allergens and respects vegetarian/vegan/keto constraints." />
            <FeatureCard icon="📈" title="Track & Improve" desc="Daily calorie and macro tracking with weekly progress reports." />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mt-12">
          <div className="bg-gradient-to-r from-white/60 to-white/40 rounded-2xl p-8 shadow-lg">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Ready to simplify healthy eating?</h3>
                <p className="text-gray-600 mt-2">Generate a weekly diet plan in seconds and take control of your nutrition.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link to="/register" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:shadow-lg transition">Create my plan</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mt-12">
          <h3 className="text-xl font-semibold mb-4">Testimonials</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow">“I never knew healthy could be this easy — the weekly plans save me time.” — Priya</div>
            <div className="bg-white rounded-xl p-6 shadow">“Allergy filters work perfectly for my nut allergy.” — Miguel</div>
            <div className="bg-white rounded-xl p-6 shadow">“Tracking macros helped me reach my goals.” — Hannah</div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default HomePage;
