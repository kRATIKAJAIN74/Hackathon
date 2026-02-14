import React, { useEffect, useState } from 'react';
import { useRecipe } from '../context/RecipeContext';
import RecipeCard from '../components/RecipeCard';
import Layout from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import FindMealModal from '../components/FindMealModal';

export const RecipesPage = () => {
  const {
    recommendations,
    favorites,
    loading,
    error,
    fetchRecommendations,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    recommendMeals,
  } = useRecipe();

  const [limit, setLimit] = useState(10);
  const [diverse, setDiverse] = useState(false);
  const [findOpen, setFindOpen] = useState(false);

  useEffect(() => {
    // Fetch recommendations and favorites on mount
    fetchFavorites();
    loadRecommendations();
  }, [limit, diverse]);

  const loadRecommendations = async () => {
    await fetchRecommendations(limit, diverse);
  };

  const handleFind = async (payload) => {
    // call expert recommend endpoint via context
    await recommendMeals(payload);
  };

  const handleFavoriteToggle = async (recipeId, isFav) => {
    if (isFav) {
      await removeFavorite(recipeId);
    } else {
      await addFavorite(recipeId);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Your Personalized Recommendations</h1>
          <p className="text-lg opacity-90">
            These recipes are specially selected based on your health goals and preferences
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Recipes
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diverse}
                    onChange={(e) => setDiverse(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show diverse cuisines
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFindOpen(true)}
                className="bg-white px-4 py-2 rounded-lg border"
              >
                Find Meal
              </button>

              <button
                onClick={loadRecommendations}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Refresh Recommendations
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
            {error}
          </div>
        )}

        {/* Recipes Grid */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recipe) => (
              <ProtectedRoute key={recipe.id} requireProfileComplete>
                <RecipeCard
                  recipe={recipe}
                  isFavorite={favorites.includes(recipe.id)}
                  onFavoriteToggle={() =>
                    handleFavoriteToggle(recipe.id, favorites.includes(recipe.id))
                  }
                />
              </ProtectedRoute>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No recipes found matching your criteria</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your preferences or health settings
            </p>
          </div>
        )}
      </div>
      <FindMealModal open={findOpen} onClose={() => setFindOpen(false)} onFind={handleFind} />
    </Layout>
  );
};

export default RecipesPage;
