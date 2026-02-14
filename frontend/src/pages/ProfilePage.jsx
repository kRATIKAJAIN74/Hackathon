import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import Layout from '../components/Layout';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    goal: user?.profile?.goal || '',
    dietType: user?.profile?.dietType || '',
    allergies: (user?.profile?.allergies || []).join(', '),
    healthConditions: user?.profile?.healthConditions || [],
    cuisines: user?.preferences?.cuisines || [],
  });

  const goals = [
    'fitness',
    'weight_loss',
    'general_wellness',
    'diabetes',
    'heart_health',
  ];

  const dietTypes = ['vegetarian', 'non_vegetarian', 'vegan'];

  const healthConditionsList = [
    'hypertension',
    'diabetes',
    'obesity',
    'high_cholesterol',
    'kidney_disease',
  ];

  const cuisineOptions = [
    'Italian',
    'Mexican',
    'Asian',
    'American',
    'Mediterranean',
    'Indian',
    'Thai',
    'Chinese',
    'Japanese',
  ];

  const toggleHealthCondition = (condition) => {
    setFormData((prev) => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter((c) => c !== condition)
        : [...prev.healthConditions, condition],
    }));
  };

  const toggleCuisine = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const allergyArray = formData.allergies
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const response = await apiClient.put('/profile/update', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        goal: formData.goal,
        dietType: formData.dietType,
        allergies: allergyArray,
        healthConditions: formData.healthConditions,
        cuisines: formData.cuisines,
      });

      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
              {success}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Goal & Diet Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select goal</option>
                    {goals.map((g) => (
                      <option key={g} value={g}>
                        {g.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diet Type
                  </label>
                  <select
                    value={formData.dietType}
                    onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select diet type</option>
                    {dietTypes.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., peanuts, shellfish (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Health Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Health Conditions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {healthConditionsList.map((condition) => (
                    <label key={condition} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.healthConditions.includes(condition)}
                        onChange={() => toggleHealthCondition(condition)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-gray-700 text-sm">
                        {condition.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Cuisines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Cuisines
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <label key={cuisine} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.cuisines.includes(cuisine)}
                        onChange={() => toggleCuisine(cuisine)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-gray-700 text-sm">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Basic Info Display */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">First Name</p>
                    <p className="text-lg font-medium text-gray-800">{user?.firstName || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Last Name</p>
                    <p className="text-lg font-medium text-gray-800">{user?.lastName || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-medium text-gray-800">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Health Profile */}
              {user?.profileCompleted && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Health Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Primary Goal</p>
                        <p className="text-lg font-medium text-gray-800">
                          {user?.profile?.goal?.replace(/_/g, ' ').toUpperCase() || '-'}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Diet Type</p>
                        <p className="text-lg font-medium text-gray-800">
                          {user?.profile?.dietType?.replace(/_/g, ' ').toUpperCase() || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Constraints */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Your Nutrition Targets
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Calorie Limit</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {user?.profile?.nutritionConstraints?.calorieLimit || '-'}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">kcal/day</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600 font-medium">Sugar Limit</p>
                        <p className="text-2xl font-bold text-red-900">
                          {user?.profile?.nutritionConstraints?.sugarLimit || '-'}
                        </p>
                        <p className="text-xs text-red-700 mt-1">g/day</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-600 font-medium">Sodium Limit</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {user?.profile?.nutritionConstraints?.sodiumLimit || '-'}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">mg/day</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 font-medium">Protein Target</p>
                        <p className="text-2xl font-bold text-green-900">
                          {user?.profile?.nutritionConstraints?.proteinTarget || '-'}
                        </p>
                        <p className="text-xs text-green-700 mt-1">g/day</p>
                      </div>
                    </div>
                  </div>

                  {/* Allergies */}
                  {user?.profile?.allergies?.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Allergies</h2>
                      <div className="flex flex-wrap gap-2">
                        {user.profile.allergies.map((allergen) => (
                          <span
                            key={allergen}
                            className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
