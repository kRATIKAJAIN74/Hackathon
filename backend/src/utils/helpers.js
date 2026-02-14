/**
 * Utility functions for the application
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format nutrition for display
 */
export const formatNutrition = (nutrition) => {
  return {
    calories: Math.round(nutrition.calories),
    protein: Math.round(nutrition.protein * 10) / 10,
    carbs: Math.round(nutrition.carbs * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
    fiber: Math.round(nutrition.fiber * 10) / 10,
    sugar: Math.round(nutrition.sugar * 10) / 10,
    sodium: Math.round(nutrition.sodium),
  };
};

/**
 * Calculate macronutrient percentages
 */
export const calculateMacroPercentages = (nutrition) => {
  const totalCalories = nutrition.calories || 1;
  const carbCalories = (nutrition.carbs || 0) * 4;
  const proteinCalories = (nutrition.protein || 0) * 4;
  const fatCalories = (nutrition.fat || 0) * 9;

  return {
    carbPercentage: Math.round((carbCalories / totalCalories) * 100),
    proteinPercentage: Math.round((proteinCalories / totalCalories) * 100),
    fatPercentage: Math.round((fatCalories / totalCalories) * 100),
  };
};

/**
 * Generate recipe difficulty badge
 */
export const getDifficultyBadge = (difficulty) => {
  const badges = {
    easy: { label: 'Easy', color: '#10B981' },
    medium: { label: 'Medium', color: '#F59E0B' },
    hard: { label: 'Challenging', color: '#EF4444' },
  };
  return badges[difficulty] || badges.medium;
};

/**
 * Calculate cooking time description
 */
export const getTimingDescription = (prepTime, cookTime) => {
  const total = (prepTime || 0) + (cookTime || 0);
  
  if (total <= 15) return 'Quick bite (≤15 min)';
  if (total <= 30) return 'Quick meal (≤30 min)';
  if (total <= 60) return 'Standard (≤60 min)';
  return 'Leisurely (60+ min)';
};

/**
 * Check if nutrition profile is healthy
 */
export const isNutritionHealthy = (nutrition, constraints) => {
  const violations = [];

  if (nutrition.calories > constraints.calorieLimit) {
    violations.push('High calorie');
  }
  if (nutrition.sugar > constraints.sugarLimit) {
    violations.push('High sugar');
  }
  if (nutrition.sodium > constraints.sodiumLimit) {
    violations.push('High sodium');
  }

  return {
    isHealthy: violations.length === 0,
    violations,
  };
};

/**
 * Sanitize user input (basic XSS prevention)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Paginate array
 */
export const paginate = (items, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
};

export default {
  isValidEmail,
  formatNutrition,
  calculateMacroPercentages,
  getDifficultyBadge,
  getTimingDescription,
  isNutritionHealthy,
  sanitizeInput,
  paginate,
};
