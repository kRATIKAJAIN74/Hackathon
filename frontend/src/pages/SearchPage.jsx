import React, { useState } from 'react';
import { useRecipe } from '../context/RecipeContext';
import RecipeCard from '../components/RecipeCard';
import Layout from '../components/Layout';

export const SearchPage = () => {
  const {
    recipes,
    favorites,
    loading,
    error,
    searchRecipes,
    addFavorite,
    removeFavorite,
    fetchFavorites,
  } = useRecipe();

  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const filters = {};
    if (cuisine) filters.cuisineType = cuisine;
    if (difficulty) filters.difficulty = difficulty;

    await searchRecipes(query, filters);
  };

  const handleFavoriteToggle = async (recipeId, isFav) => {
    if (isFav) {
      await removeFavorite(recipeId);
    } else {
      await addFavorite(recipeId);
    }
  };

  const cuisines = [
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-primary rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Search Recipes</h1>
          <p className="text-lg opacity-90">
            Find recipes tailored to your nutrition goals and preferences
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for recipes... (e.g., 'healthy pasta', 'vegetarian breakfast')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Toggle Filters */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-primary font-medium text-sm hover:underline"
            >
              {showFilters ? '− Hide Filters' : '+ Show Filters'}
            </button>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Type
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Cuisines</option>
                    {cuisines.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>

        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
            {error}
          </div>
        )}

        {/* Results */}
        {recipes.length > 0 ? (
          <div>
            <p className="text-gray-600 mb-4">
              Found <strong>{recipes.length}</strong> recipe{recipes.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={favorites.includes(recipe.id)}
                  onFavoriteToggle={() =>
                    handleFavoriteToggle(recipe.id, favorites.includes(recipe.id))
                  }
                />
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No recipes found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try different keywords or adjust your filters
            </p>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">Start searching for recipes</p>
            <p className="text-gray-500 text-sm mt-2">
              Enter a search term above to find personalized recipes
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
