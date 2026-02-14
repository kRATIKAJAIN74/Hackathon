import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import Layout from '../components/Layout';

export const ProfileSetupPage = () => {
  const [goal, setGoal] = useState('');
  const [dietType, setDietType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [healthConditions, setHealthConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const goals = [
    { id: 'fitness', label: 'Fitness', icon: '💪', desc: 'Muscle building & fitness' },
    { id: 'weight_loss', label: 'Weight Loss', icon: '📉', desc: 'Sustainable weight loss' },
    { id: 'general_wellness', label: 'Wellness', icon: '🌿', desc: 'Overall health' },
    { id: 'diabetes', label: 'Diabetes', icon: '🩺', desc: 'Low sugar diet' },
    { id: 'heart_health', label: 'Heart Health', icon: '❤️', desc: 'Heart-healthy diet' },
  ];

  const dietTypes = [
    { id: 'non_vegetarian', label: 'Non-Vegetarian' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
  ];

  const healthConditionsList = [
    'Hypertension',
    'Diabetes',
    'Obesity',
    'High Cholesterol',
    'Kidney Disease',
  ];

  const toggleHealthCondition = (condition) => {
    setHealthConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!goal || !dietType) {
      setError('Please select both goal and diet type');
      return;
    }

    setLoading(true);

    try {
      const allergyArray = allergies
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const response = await apiClient.post('/profile/setup', {
        goal,
        dietType,
        allergies: allergyArray,
        healthConditions: healthConditions.map((c) => c.toLowerCase().replace(' ', '_')),
      });

      updateUser(response.data.user);
      navigate(response.data.redirectTo);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 mb-8">
            Help us personalize your nutrition recommendations
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Goal Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What's your primary goal?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      goal === g.id
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="text-3xl mb-2">{g.icon}</div>
                    <div className="font-semibold text-gray-800">{g.label}</div>
                    <div className="text-sm text-gray-600">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Type Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What's your diet type?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dietTypes.map((dt) => (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setDietType(dt.id)}
                    className={`p-4 rounded-lg border-2 transition font-medium ${
                      dietType === dt.id
                        ? 'border-primary bg-primary bg-opacity-10 text-primary'
                        : 'border-gray-200 text-gray-700 hover:border-primary'
                    }`}
                  >
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Do you have any allergies?</h2>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g., peanuts, shellfish, milk (comma-separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Leave empty if no allergies. Separate multiple allergies with commas.
              </p>
            </div>

            {/* Health Conditions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Any health conditions to consider?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {healthConditionsList.map((condition) => (
                  <label key={condition} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={healthConditions.includes(condition)}
                      onChange={() => toggleHealthCondition(condition)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !goal || !dietType}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Setting up your profile...' : 'Continue to Recipes'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            You can update these settings anytime in your profile
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSetupPage;
