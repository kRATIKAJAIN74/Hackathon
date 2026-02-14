import {
  validateRecipeConstraints,
  calculateRecipeScore,
} from './nutritionRuleEngine.js';

/**
 * Recipe Filtering and Ranking Service
 */

/**
 * Filter recipes based on user profile and constraints
 */
export const filterRecipesForUser = (recipes, userProfile) => {
  if (!recipes || recipes.length === 0) {
    return [];
  }

  return recipes.filter((recipe) => {
    // 1. Check allergies
    if (userProfile.profile?.allergies && userProfile.profile.allergies.length > 0) {
      const hasAllergen = userProfile.profile.allergies.some((allergen) =>
        (recipe.allergens || []).some((recipeAllergen) =>
          recipeAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
          allergen.toLowerCase().includes(recipeAllergen.toLowerCase())
        )
      );
      if (hasAllergen) return false;
    }

    // 2. Check diet type
    if (userProfile.profile?.dietType) {
      if (!isRecipeSuitableForDiet(recipe, userProfile.profile.dietType)) {
        return false;
      }
    }

    // 3. Nutrition constraints validation
    const constraints = userProfile.profile?.nutritionConstraints;
    if (constraints) {
      const validation = validateRecipeConstraints(
        {
          calories: recipe.nutrition.calories,
          sugar: recipe.nutrition.sugar,
          sodium: recipe.nutrition.sodium,
          protein: recipe.nutrition.protein,
        },
        constraints
      );
      
      if (validation.violations.length > 2) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Check if recipe is suitable for user's diet type
 */
const isRecipeSuitableForDiet = (recipe, dietType) => {
  const tags = ((recipe.tags || []).map((t) => t.toLowerCase()));
  const description = (recipe.description || '').toLowerCase();
  
  switch (dietType) {
    case 'vegetarian':
      return !tags.some((tag) => ['meat', 'beef', 'chicken', 'fish', 'seafood'].includes(tag)) &&
        !description.includes('meat') &&
        !description.includes('beef') &&
        !description.includes('chicken') &&
        !description.includes('fish');
    
    case 'vegan':
      return !tags.some((tag) => ['meat', 'beef', 'chicken', 'fish', 'seafood', 'dairy', 'egg', 'milk'].includes(tag)) &&
        !description.includes('meat') &&
        !description.includes('dairy') &&
        !description.includes('egg') &&
        !description.includes('milk');
    
    case 'non_vegetarian':
      return true;
    
    default:
      return true;
  }
};

/**
 * Rank filtered recipes based on user profile
 */
export const rankRecipes = (recipes, userProfile) => {
  const constraints = userProfile.profile?.nutritionConstraints;
  
  if (!constraints) {
    return recipes.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  const rankedRecipes = recipes.map((recipe) => {
    let score = calculateRecipeScore(
      {
        calories: recipe.nutrition.calories,
        sugar: recipe.nutrition.sugar,
        sodium: recipe.nutrition.sodium,
        protein: recipe.nutrition.protein,
      },
      constraints
    );

    score += calculateCuisineBonus(recipe, userProfile);
    score += calculateFavoriteBonus(recipe, userProfile);
    score += calculateDifficultyBonus(recipe);

    return {
      ...recipe,
      score,
      reasoning: generateScoreReasoning(recipe, score, constraints),
    };
  });

  return rankedRecipes.sort((a, b) => b.score - a.score);
};

/**
 * Calculate cuisine preference bonus
 */
const calculateCuisineBonus = (recipe, userProfile) => {
  const preferredCuisines = userProfile.preferences?.cuisines || [];
  
  if (preferredCuisines.length === 0) {
    return 0;
  }

  return preferredCuisines.some((cuisine) =>
    recipe.cuisineType.toLowerCase().includes(cuisine.toLowerCase())
  ) ? 10 : 0;
};

/**
 * Calculate favorite recipe bonus
 */
const calculateFavoriteBonus = (recipe, userProfile) => {
  const favorites = userProfile.favoriteRecipes || [];
  return favorites.includes(recipe.id) ? 20 : 0;
};

/**
 * Calculate difficulty bonus
 */
const calculateDifficultyBonus = (recipe) => {
  const difficultyScores = {
    easy: 5,
    medium: 0,
    hard: -5,
  };
  return difficultyScores[recipe.difficulty] || 0;
};

/**
 * Generate human-readable explanation for the recipe score
 */
const generateScoreReasoning = (recipe, score, constraints) => {
  const reasons = [];

  const calorieUsage = (recipe.nutrition.calories / constraints.calorieLimit) * 100;
  if (calorieUsage < 80) {
    reasons.push('Low calorie count');
  } else if (calorieUsage < 100) {
    reasons.push('Good calorie fit');
  }

  const proteinUsage = (recipe.nutrition.protein / constraints.proteinTarget) * 100;
  if (proteinUsage >= 80 && proteinUsage <= 120) {
    reasons.push('Excellent protein match');
  }

  const sugarUsage = (recipe.nutrition.sugar / constraints.sugarLimit) * 100;
  if (sugarUsage < 50) {
    reasons.push('Very low sugar');
  }

  if (reasons.length === 0) {
    reasons.push('Meets basic nutritional guidelines');
  }

  return reasons.join(' • ');
};

/**
 * Get top N recommendations
 */
export const getTopRecommendations = (recipes, userProfile, limit = 10) => {
  const filtered = filterRecipesForUser(recipes, userProfile);
  const ranked = rankRecipes(filtered, userProfile);
  return ranked.slice(0, limit);
};

/**
 * Get diversified recommendations
 */
export const getDiverseRecommendations = (recipes, userProfile, limit = 10) => {
  const filtered = filterRecipesForUser(recipes, userProfile);
  const ranked = rankRecipes(filtered, userProfile);

  const diverse = [];
  const cuisinesSeen = new Set();

  for (const recipe of ranked) {
    if (diverse.length === 0) {
      diverse.push(recipe);
      cuisinesSeen.add(recipe.cuisineType);
      continue;
    }

    if (cuisinesSeen.has(recipe.cuisineType)) {
      if (diverse.length < limit * 0.5) {
        diverse.push(recipe);
      }
    } else {
      diverse.push(recipe);
      cuisinesSeen.add(recipe.cuisineType);
    }

    if (diverse.length >= limit) break;
  }

  return diverse;
};

export default {
  filterRecipesForUser,
  rankRecipes,
  getTopRecommendations,
  getDiverseRecommendations,
};
