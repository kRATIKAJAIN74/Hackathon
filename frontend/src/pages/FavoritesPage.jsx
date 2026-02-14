import React, { useEffect, useState } from 'react';
import { useRecipe } from '../context/RecipeContext';
import apiClient from '../utils/apiClient';
import RecipeCard from '../components/RecipeCard';
import Layout from '../components/Layout';

export const FavoritesPage = () => {
  const { favorites, loading, addFavorite, removeFavorite, fetchFavorites } = useRecipe();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoadingRecipes(true);
    try {
      await fetchFavorites();
      
      // Fetch detailed recipe data for favorites
      if (favorites.length > 0) {
        const recipes = [];
        for (const recipeId of favorites) {
          try {
            const response = await apiClient.get(`/recipes/id/${recipeId}`);
            recipes.push(response.data.recipe);
          } catch (err) {
            console.error(`Failed to load recipe ${recipeId}`);
          }
        }
        setFavoriteRecipes(recipes);
      } else {
        setFavoriteRecipes([]);
      }
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleFavoriteToggle = async (recipeId, isFav) => {
    if (isFav) {
      await removeFavorite(recipeId);
      setFavoriteRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    } else {
      await addFavorite(recipeId);
    }
  };

  if (loadingRecipes) {
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
        <div className="bg-gradient-to-r from-red-400 to-pink-500 rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Your Favorite Recipes</h1>
          <p className="text-lg opacity-90">
            {favoriteRecipes.length > 0
              ? `You have ${favoriteRecipes.length} saved recipe${
                  favoriteRecipes.length !== 1 ? 's' : ''
                }`
              : 'Save recipes to view them here'}
          </p>
        </div>

        {/* Recipes Grid */}
        {favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={true}
                onFavoriteToggle={() => handleFavoriteToggle(recipe.id, true)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-gray-600 text-xl">No favorite recipes yet</p>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              Explore our personalized recommendations and save your favorite recipes here
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
