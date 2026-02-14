import { User } from '../models/User.js';
import { searchRecipes, getRecipesByCuisine, getRecipeById } from '../services/foodoscopeService.js';
import {
  filterRecipesForUser,
  rankRecipes,
  getTopRecommendations,
  getDiverseRecommendations,
} from '../services/recipeFilteringService.js';
import { getNutritionRules } from '../services/nutritionRuleEngine.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

/**
 * Get personalized recipe recommendations
 */
export const getRecommendations = catchAsync(async (req, res) => {
  const { limit = 10, diverse = false } = req.query;

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.profileCompleted) {
    throw new AppError('Profile setup required', 403);
  }

  try {
    const recipes = await searchRecipes('healthy recipes', {
      limit: 50,
    });

    if (recipes.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No recipes found matching your criteria',
      });
    }

    let recommendations;
    if (diverse === 'true' || diverse === true) {
      recommendations = getDiverseRecommendations(recipes, user, parseInt(limit));
    } else {
      recommendations = getTopRecommendations(recipes, user, parseInt(limit));
    }

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    
    res.json({
      success: true,
      recommendations: [],
      message: 'Unable to fetch recommendations at this time',
    });
  }
});

/**
 * Search recipes with filters
 */
export const searchRecipesEndpoint = catchAsync(async (req, res) => {
  const { q, cuisineType, difficulty, limit = 20 } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.profileCompleted) {
    throw new AppError('Profile setup required', 403);
  }

  try {
    const filters = {};
    if (cuisineType) filters.cuisineType = cuisineType;
    if (difficulty) filters.difficulty = difficulty;

    const recipes = await searchRecipes(q, filters);

    if (recipes.length === 0) {
      return res.json({
        success: true,
        recipes: [],
        message: 'No recipes found',
      });
    }

    const filtered = filterRecipesForUser(recipes, user);
    const ranked = rankRecipes(filtered, user);
    const top = ranked.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: top.length,
      recipes: top,
    });
  } catch (error) {
    console.error('Error searching recipes:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching recipes',
    });
  }
});

/**
 * Get recipes by cuisine type
 */
export const getRecipesByCuisineEndpoint = catchAsync(async (req, res) => {
  const { cuisineType } = req.params;
  const { limit = 20 } = req.query;

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.profileCompleted) {
    throw new AppError('Profile setup required', 403);
  }

  try {
    const recipes = await getRecipesByCuisine(cuisineType, { limit: 50 });

    if (recipes.length === 0) {
      return res.json({
        success: true,
        recipes: [],
        message: `No recipes found for cuisine: ${cuisineType}`,
      });
    }

    const filtered = filterRecipesForUser(recipes, user);
    const ranked = rankRecipes(filtered, user);
    const top = ranked.slice(0, parseInt(limit));

    res.json({
      success: true,
      cuisine: cuisineType,
      count: top.length,
      recipes: top,
    });
  } catch (error) {
    console.error('Error fetching recipes by cuisine:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
    });
  }
});

/**
 * Get recipe details
 */
export const getRecipeDetail = catchAsync(async (req, res) => {
  const { recipeId } = req.params;

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.profileCompleted) {
    throw new AppError('Profile setup required', 403);
  }

  try {
    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    const isFavorite = user.favoriteRecipes.includes(recipeId);

    res.json({
      success: true,
      recipe,
      isFavorite,
    });
  } catch (error) {
    console.error('Error fetching recipe:', error.message);
    throw new AppError('Recipe not found', 404);
  }
});

/**
 * Get nutrition rules (for admin/debug)
 */
export const getNutritionRulesEndpoint = catchAsync(async (req, res) => {
  const rules = getNutritionRules();

  res.json({
    success: true,
    rules,
  });
});

export default {
  getRecommendations,
  searchRecipesEndpoint,
  getRecipesByCuisineEndpoint,
  getRecipeDetail,
  getNutritionRulesEndpoint,
};
