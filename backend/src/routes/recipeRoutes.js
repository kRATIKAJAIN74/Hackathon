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
 * Public recipe routes
 */
router.get('/rules/nutrition', getNutritionRulesEndpoint);

/**
 * Personalized recipe routes
 */
router.get('/recommendations', getRecommendations);
router.get('/search', searchRecipesEndpoint);
router.get('/cuisine/:cuisineType', getRecipesByCuisineEndpoint);
router.get('/id/:recipeId', getRecipeDetail);

export default router;
