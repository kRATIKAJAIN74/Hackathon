import express from 'express';
import {
  getRecommendations,
  searchRecipesEndpoint,
  getRecipesByCuisineEndpoint,
  getRecipeDetail,
  getNutritionRulesEndpoint,
} from '../controllers/recipeController.js';
import { verifyToken, requireProfileCompletion } from '../middleware/auth.js';

const router = express.Router();

/**
 * All recipe routes require authentication
 */
router.use(verifyToken);

/**
 * Public recipe routes (no profile completion required)
 */
router.get('/rules/nutrition', getNutritionRulesEndpoint);

/**
 * Personalized recipe routes (require profile completion)
 */

/**
 * Get personalized recommendations
 * GET /recipes/recommendations?limit=10&diverse=false
 */
router.get('/recommendations', getRecommendations);

/**
 * Search recipes
 * GET /recipes/search?q=pasta&cuisineType=italian&limit=20
 */
router.get('/search', searchRecipesEndpoint);

/**
 * Get recipes by cuisine
 * GET /recipes/cuisine/italian?limit=20
 */
router.get('/cuisine/:cuisineType', getRecipesByCuisineEndpoint);

/**
 * Get specific recipe details
 * GET /recipes/id/:recipeId
 */
router.get('/id/:recipeId', getRecipeDetail);

export default router;
