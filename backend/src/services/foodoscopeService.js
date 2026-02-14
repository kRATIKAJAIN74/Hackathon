import axios from 'axios';
import NodeCache from 'node-cache';
import config from '../config/config.js';

// Initialize cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: config.cacheDuration });

const apiClient = axios.create({
  baseURL: config.foodoscopeApiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key to requests if available
if (config.foodoscopeApiKey) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${config.foodoscopeApiKey}`;
}

/**
 * Generate cache key for recipes
 */
const getCacheKey = (endpoint, params) => {
  return `${endpoint}:${JSON.stringify(params)}`;
};

/**
 * Normalize nutrition data from Foodoscope API
 */
const normalizeRecipe = (recipe) => {
  return {
    id: recipe.id || recipe._id,
    name: recipe.name || recipe.title || 'Unknown',
    description: recipe.description || '',
    cuisineType: recipe.cuisineType || recipe.cuisine || 'general',
    servings: recipe.servings || 1,
    prepTime: recipe.prepTime || 0,
    cookTime: recipe.cookTime || 0,
    totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
    difficulty: recipe.difficulty || 'medium',
    imageUrl: recipe.imageUrl || recipe.image || null,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || recipe.steps || [],
    
    // Nutrition - safe defaults
    nutrition: {
      calories: recipe.nutrition?.calories || recipe.calories || 0,
      protein: recipe.nutrition?.protein || recipe.protein || 0,
      carbs: recipe.nutrition?.carbs || recipe.carbs || 0,
      fat: recipe.nutrition?.fat || recipe.fat || 0,
      fiber: recipe.nutrition?.fiber || recipe.fiber || 0,
      sugar: recipe.nutrition?.sugar || recipe.sugar || 0,
      sodium: recipe.nutrition?.sodium || recipe.sodium || 0,
      cholesterol: recipe.nutrition?.cholesterol || recipe.cholesterol || 0,
    },
    
    // Source info
    source: {
      api: 'foodoscope',
      url: recipe.sourceUrl || recipe.url || null,
      originalId: recipe.id || recipe._id,
    },
    
    // Tags
    tags: recipe.tags || [],
    allergens: recipe.allergens || [],
  };
};

/**
 * Search recipes with filters
 */
export const searchRecipes = async (query, filters = {}) => {
  try {
    const cacheKey = getCacheKey('search', { query, filters });
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit: ${cacheKey}`);
      return cachedResult;
    }

    const response = await apiClient.get('/recipes/search', {
      params: {
        q: query,
        ...filters,
      },
    });

    const normalizedRecipes = (response.data.results || response.data || []).map(normalizeRecipe);

    cache.set(cacheKey, normalizedRecipes);

    return normalizedRecipes;
  } catch (error) {
    console.error('Error searching recipes:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Foodoscope API key');
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limited by Foodoscope API');
    }
    
    return [];
  }
};

/**
 * Get recipe by ID
 */
export const getRecipeById = async (recipeId) => {
  try {
    const cacheKey = getCacheKey('recipe', { id: recipeId });
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit: ${cacheKey}`);
      return cachedResult;
    }

    const response = await apiClient.get(`/recipes/${recipeId}`);
    const normalizedRecipe = normalizeRecipe(response.data);

    cache.set(cacheKey, normalizedRecipe);
    
    return normalizedRecipe;
  } catch (error) {
    console.error(`Error fetching recipe ${recipeId}:`, error.message);
    return null;
  }
};

/**
 * Get trending/popular recipes
 */
export const getTrendingRecipes = async (filters = {}) => {
  try {
    const cacheKey = getCacheKey('trending', filters);
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit: ${cacheKey}`);
      return cachedResult;
    }

    const response = await apiClient.get('/recipes/trending', {
      params: filters,
    });

    const normalizedRecipes = (response.data.results || response.data || []).map(normalizeRecipe);

    cache.set(cacheKey, normalizedRecipes);
    
    return normalizedRecipes;
  } catch (error) {
    console.error('Error fetching trending recipes:', error.message);
    return [];
  }
};

/**
 * Get recipes by cuisine type
 */
export const getRecipesByCuisine = async (cuisine, filters = {}) => {
  try {
    const cacheKey = getCacheKey('cuisine', { cuisine, ...filters });
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit: ${cacheKey}`);
      return cachedResult;
    }

    const response = await apiClient.get('/recipes/cuisine', {
      params: {
        cuisineType: cuisine,
        ...filters,
      },
    });

    const normalizedRecipes = (response.data.results || response.data || []).map(normalizeRecipe);

    cache.set(cacheKey, normalizedRecipes);
    
    return normalizedRecipes;
  } catch (error) {
    console.error(`Error fetching recipes for cuisine ${cuisine}:`, error.message);
    return [];
  }
};

/**
 * Clear cache (useful for testing)
 */
export const clearCache = () => {
  cache.flushAll();
  console.log('Cache cleared');
};

/**
 * Get cache stats
 */
export const getCacheStats = () => {
  return cache.getStats();
};

export default {
  searchRecipes,
  getRecipeById,
  getTrendingRecipes,
  getRecipesByCuisine,
  clearCache,
  getCacheStats,
};
