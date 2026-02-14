import { User } from '../models/User.js';
import { computeNutritionConstraints } from '../services/nutritionRuleEngine.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

/**
 * Set up user profile (onboarding)
 * POST /profile/setup
 * Requires: verifyToken middleware
 */
export const setupProfile = catchAsync(async (req, res) => {
  const { goal, dietType, allergies, healthConditions, firstName, lastName } = req.body;

  // Validation
  if (!goal || !dietType) {
    throw new AppError('Goal and diet type are required', 400);
  }

  const validGoals = [
    'fitness',
    'weight_loss',
    'general_wellness',
    'diabetes',
    'heart_health',
  ];
  if (!validGoals.includes(goal)) {
    throw new AppError(`Invalid goal. Must be one of: ${validGoals.join(', ')}`, 400);
  }

  const validDietTypes = ['vegetarian', 'non_vegetarian', 'vegan'];
  if (!validDietTypes.includes(dietType)) {
    throw new AppError(`Invalid diet type. Must be one of: ${validDietTypes.join(', ')}`, 400);
  }

  // Get user
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update profile
  user.profile.goal = goal;
  user.profile.dietType = dietType;
  user.profile.allergies = allergies || [];
  user.profile.healthConditions = healthConditions || [];

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  // Compute nutrition constraints based on profile
  const nutritionConstraints = computeNutritionConstraints(user.profile);
  user.profile.nutritionConstraints = nutritionConstraints;

  // Mark profile as completed
  user.profileCompleted = true;

  await user.save();

  res.json({
    success: true,
    message: 'Profile setup completed successfully',
    user: user.toJSON(),
    nutritionConstraints,
    redirectTo: '/recipes/recommendations',
  });
});

/**
 * Update user profile
 * PUT /profile/update
 * Requires: verifyToken middleware
 */
export const updateProfile = catchAsync(async (req, res) => {
  const { goal, dietType, allergies, healthConditions, cuisines, firstName, lastName } = req.body;

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update only provided fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (goal) user.profile.goal = goal;
  if (dietType) user.profile.dietType = dietType;
  if (allergies) user.profile.allergies = allergies;
  if (healthConditions) user.profile.healthConditions = healthConditions;
  if (cuisines) user.preferences.cuisines = cuisines;

  // Recompute nutrition constraints if profile changed
  const nutritionConstraints = computeNutritionConstraints(user.profile);
  user.profile.nutritionConstraints = nutritionConstraints;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toJSON(),
    nutritionConstraints,
  });
});

/**
 * Get user profile
 * GET /profile
 * Requires: verifyToken middleware
 */
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    user: user.toJSON(),
  });
});

/**
 * Add recipe to favorites
 * POST /profile/favorites/add
 * Requires: verifyToken middleware
 */
export const addFavorite = catchAsync(async (req, res) => {
  const { recipeId } = req.body;

  if (!recipeId) {
    throw new AppError('Recipe ID is required', 400);
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Add if not already present
  if (!user.favoriteRecipes.includes(recipeId)) {
    user.favoriteRecipes.push(recipeId);
    await user.save();
  }

  res.json({
    success: true,
    message: 'Recipe added to favorites',
    favoriteCount: user.favoriteRecipes.length,
  });
});

/**
 * Remove recipe from favorites
 * DELETE /profile/favorites/remove
 * Requires: verifyToken middleware
 */
export const removeFavorite = catchAsync(async (req, res) => {
  const { recipeId } = req.body;

  if (!recipeId) {
    throw new AppError('Recipe ID is required', 400);
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Remove from favorites
  user.favoriteRecipes = user.favoriteRecipes.filter((id) => id !== recipeId);
  await user.save();

  res.json({
    success: true,
    message: 'Recipe removed from favorites',
    favoriteCount: user.favoriteRecipes.length,
  });
});

/**
 * Get user favorites
 * GET /profile/favorites
 * Requires: verifyToken middleware
 */
export const getFavorites = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    favorites: user.favoriteRecipes,
    count: user.favoriteRecipes.length,
  });
});

export default {
  setupProfile,
  updateProfile,
  getProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
};
