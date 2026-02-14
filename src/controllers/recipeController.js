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
 * GET /recipes/recommendations
 * Requires: verifyToken + profileCompleted
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
    // Fetch recipes from Foodoscope (can be any search, trending, or filtered)
    // For demo, using general search - in production, could be more sophisticated
    const recipes = await searchRecipes('healthy recipes', {
      limit: 50, // Fetch more to have better recommendations after filtering
    });

    if (recipes.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No recipes found matching your criteria',
      });
    }

    // Apply filtering and ranking
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
    
    // Graceful degradation - return empty recommendations
    res.json({
      success: true,
      recommendations: [],
      message: 'Unable to fetch recommendations at this time',
    });
  }
});

/**
 * Search recipes with filters
 * GET /recipes/search?q=pasta&cuisineType=italian
 * Requires: verifyToken + profileCompleted
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
    // Build filters for Foodoscope API
    // NOTE: Only expose safe filters, not raw Foodoscope API schema
    const filters = {};
    if (cuisineType) filters.cuisineType = cuisineType;
    if (difficulty) filters.difficulty = difficulty;

    // Fetch recipes
    const recipes = await searchRecipes(q, filters);

    if (recipes.length === 0) {
      return res.json({
        success: true,
        recipes: [],
        message: 'No recipes found',
      });
    }

    // Filter for user constraints
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
 * GET /recipes/cuisine/:cuisineType
 * Requires: verifyToken + profileCompleted
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

    // Filter and rank
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
 * GET /recipes/:recipeId
 * Requires: verifyToken + profileCompleted
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

    // Add user context
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
 * GET /recipes/rules/nutrition
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
