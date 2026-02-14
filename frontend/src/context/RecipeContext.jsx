import React, { createContext, useContext, useState } from 'react';
import apiClient from '../utils/apiClient';

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expertMeta, setExpertMeta] = useState(null);

  const fetchRecommendations = async (limit = 10, diverse = false) => {
    setLoading(true);
    setError(null);
    setExpertMeta(null);
    try {
      const response = await apiClient.get('/recipes/recommendations', {
        params: { limit, diverse },
      });
      const list = Array.isArray(response.data.recommendations) ? response.data.recommendations : [];
      setRecommendations(list);
      return list;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch recommendations';
      setError(errorMsg);
      console.error('Error fetching recommendations:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const recommendMeals = async (payload = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/expert/recommend', payload);
      const data = response.data || {};
      const rawList = Array.isArray(data.recommendations) ? data.recommendations : [];
      setExpertMeta({
        targets: data.targets || null,
        totalCandidates: data.totalCandidates ?? 0,
        filteredCount: data.filteredCount ?? 0,
      });
      // Backend returns { id, title, calories, protein, score, reasons, recipe }; merge for RecipeCard
      const list = rawList.map((r) => {
        const recipe = r.recipe || r;
        const id = r.id ?? recipe.id ?? recipe.name ?? 'unknown';
        const title = r.title ?? recipe.title ?? recipe.name ?? 'Recipe';
        const calories = typeof r.calories === 'number' ? r.calories : (recipe.nutrition && recipe.nutrition.calories) ?? recipe.calories ?? 0;
        const protein = typeof r.protein === 'number' ? r.protein : (recipe.nutrition && recipe.nutrition.protein) ?? recipe.protein ?? 0;
        return {
          ...recipe,
          id,
          title,
          name: title,
          calories,
          protein,
          nutrition: {
            ...(recipe.nutrition || {}),
            calories,
            protein,
            sugar: recipe.nutrition?.sugar ?? recipe.sugar ?? 0,
            sodium: recipe.nutrition?.sodium ?? recipe.sodium ?? 0,
          },
          score: r.score,
          reasons: Array.isArray(r.reasons) ? r.reasons : [],
        };
      });
      setRecommendations(list.slice(0, 20));
      return list;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to get meal recommendations';
      setError(errorMsg);
      console.error('Error recommending meals:', err);
      setExpertMeta(null);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async (query, filters = {}, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/recipes/search', {
        params: { q: query, ...filters, limit },
      });
      setRecipes(response.data.recipes);
      return response.data.recipes;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to search recipes';
      setError(errorMsg);
      console.error('Error searching recipes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecipesByCuisine = async (cuisine, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/recipes/cuisine/${cuisine}`, {
        params: { limit },
      });
      setRecipes(response.data.recipes);
      return response.data.recipes;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch recipes';
      setError(errorMsg);
      console.error('Error fetching recipes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecipeDetail = async (recipeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/recipes/id/${recipeId}`);
      return response.data.recipe;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch recipe';
      setError(errorMsg);
      console.error('Error fetching recipe:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (recipeId) => {
    try {
      await apiClient.post('/profile/favorites/add', { recipeId });
      setFavorites((prev) => [...new Set([...prev, recipeId])]);
      return true;
    } catch (err) {
      console.error('Error adding favorite:', err);
      return false;
    }
  };

  const removeFavorite = async (recipeId) => {
    try {
      await apiClient.delete('/profile/favorites/remove', {
        data: { recipeId },
      });
      setFavorites((prev) => prev.filter((id) => id !== recipeId));
      return true;
    } catch (err) {
      console.error('Error removing favorite:', err);
      return false;
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await apiClient.get('/profile/favorites');
      setFavorites(response.data.favorites);
      return response.data.favorites;
    } catch (err) {
      console.error('Error fetching favorites:', err);
      return [];
    }
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        recommendations,
        favorites,
        loading,
        error,
        expertMeta,
        fetchRecommendations,
        searchRecipes,
        getRecipesByCuisine,
        getRecipeDetail,
        addFavorite,
        removeFavorite,
        fetchFavorites,
        recommendMeals,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within RecipeProvider');
  }
  return context;
};
