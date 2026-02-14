/**
 * Nutrition Rule Engine
 * Maps health goals/diseases to nutrition constraints
 * Configurable and extensible - NOT hardcoded in controllers
 */

const NUTRITION_RULES = {
  // Goal-based rules
  goals: {
    fitness: {
      calorieLimit: 2200,
      proteinTarget: 150,
      sugarLimit: 50,
      sodiumLimit: 2300,
      description: 'Optimized for muscle building and fitness',
    },
    weight_loss: {
      calorieLimit: 1800,
      proteinTarget: 100,
      sugarLimit: 30,
      sodiumLimit: 2000,
      description: 'Low calorie diet for sustainable weight loss',
    },
    general_wellness: {
      calorieLimit: 2000,
      proteinTarget: 50,
      sugarLimit: 50,
      sodiumLimit: 2300,
      description: 'Balanced nutrition for overall wellness',
    },
    diabetes: {
      calorieLimit: 1800,
      proteinTarget: 75,
      sugarLimit: 5, // Very strict
      sodiumLimit: 2000,
      description: 'Low sugar diet for diabetes management',
    },
    heart_health: {
      calorieLimit: 2000,
      proteinTarget: 70,
      sugarLimit: 40,
      sodiumLimit: 1500, // Strict sodium for hypertension
      description: 'Heart-healthy low sodium diet',
    },
  },

  // Disease/condition-based rules (can override goals)
  conditions: {
    hypertension: {
      sodiumLimit: 1500,
      calorieLimit: 'inherit', // Keep from goal
    },
    diabetes: {
      sugarLimit: 5,
      calorieLimit: 'inherit',
    },
    obesity: {
      calorieLimit: 1600,
      sugarLimit: 'inherit',
    },
    high_cholesterol: {
      sodiumLimit: 2000,
      calorieLimit: 'inherit',
    },
    kidney_disease: {
      sodiumLimit: 1000,
      proteinTarget: 0.5, // Reduced protein for kidney disease
    },
  },

  // Allergen penalties (used in recipe scoring)
  allergenPenalty: -100, // Severe penalty for violating allergies
  
  // Recipe constraint penalties (used in scoring)
  constraintViolationPenalty: -50,
  constraintBonusPercentage: 0.05, // 5% bonus per constraint matched
};

/**
 * Compute nutrition constraints based on user profile
 * @param {Object} profile - User profile with goal and health conditions
 * @returns {Object} Computed nutrition constraints
 */
export const computeNutritionConstraints = (profile) => {
  if (!profile || !profile.goal) {
    // Return default constraints if no profile
    return {
      calorieLimit: 2000,
      sugarLimit: 50,
      sodiumLimit: 2300,
      proteinTarget: 50,
    };
  }

  // Start with goal-based constraints
  const goalConstraints = NUTRITION_RULES.goals[profile.goal] || NUTRITION_RULES.goals.general_wellness;
  const constraints = {
    calorieLimit: goalConstraints.calorieLimit,
    sugarLimit: goalConstraints.sugarLimit,
    sodiumLimit: goalConstraints.sodiumLimit,
    proteinTarget: goalConstraints.proteinTarget,
  };

  // Override/enhance with health condition constraints
  if (profile.healthConditions && profile.healthConditions.length > 0) {
    profile.healthConditions.forEach((condition) => {
      const conditionRule = NUTRITION_RULES.conditions[condition];
      if (conditionRule) {
        // Override only if value is not 'inherit'
        if (conditionRule.calorieLimit && conditionRule.calorieLimit !== 'inherit') {
          constraints.calorieLimit = conditionRule.calorieLimit;
        }
        if (conditionRule.sugarLimit && conditionRule.sugarLimit !== 'inherit') {
          constraints.sugarLimit = conditionRule.sugarLimit;
        }
        if (conditionRule.sodiumLimit && conditionRule.sodiumLimit !== 'inherit') {
          constraints.sodiumLimit = conditionRule.sodiumLimit;
        }
        if (conditionRule.proteinTarget && conditionRule.proteinTarget !== 'inherit') {
          constraints.proteinTarget = conditionRule.proteinTarget;
        }
      }
    });
  }

  return constraints;
};

/**
 * Get rules for admin/frontend display
 * @returns {Object} All nutrition rules
 */
export const getNutritionRules = () => {
  return {
    goals: Object.keys(NUTRITION_RULES.goals),
    conditions: Object.keys(NUTRITION_RULES.conditions),
    rules: NUTRITION_RULES,
  };
};

/**
 * Validate if a recipe meets nutrition constraints
 * @param {Object} recipe - Recipe with nutrition info
 * @param {Object} constraints - User's nutrition constraints
 * @returns {Object} Validation result with violations
 */
export const validateRecipeConstraints = (recipe, constraints) => {
  const violations = [];

  if (recipe.calories > constraints.calorieLimit) {
    violations.push({
      field: 'calories',
      value: recipe.calories,
      limit: constraints.calorieLimit,
      severity: 'high',
    });
  }

  if (recipe.sugar > constraints.sugarLimit) {
    violations.push({
      field: 'sugar',
      value: recipe.sugar,
      limit: constraints.sugarLimit,
      severity: 'high',
    });
  }

  if (recipe.sodium > constraints.sodiumLimit) {
    violations.push({
      field: 'sodium',
      value: recipe.sodium,
      limit: constraints.sodiumLimit,
      severity: 'high',
    });
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
};

/**
 * Calculate recipe score based on nutrition alignment
 * Higher score = better match for user constraints
 * @param {Object} recipe - Recipe with nutrition info
 * @param {Object} constraints - User's nutrition constraints
 * @returns {number} Score (0-100+)
 */
export const calculateRecipeScore = (recipe, constraints) => {
  let score = 50; // Base score

  const calorieUsage = (recipe.calories / constraints.calorieLimit) * 100;
  const sugarUsage = (recipe.sugar / constraints.sugarLimit) * 100;
  const sodiumUsage = (recipe.sodium / constraints.sodiumLimit) * 100;
  const proteinUsage = (recipe.protein / constraints.proteinTarget) * 100;

  // Penalize if over limits
  if (calorieUsage > 100) score -= (calorieUsage - 100) * 0.3;
  if (sugarUsage > 100) score -= (sugarUsage - 100) * 0.5;
  if (sodiumUsage > 100) score -= (sodiumUsage - 100) * 0.4;

  // Bonus if within 80-100% of target (good alignment)
  if (proteinUsage >= 80 && proteinUsage <= 100) score += 20;
  if (calorieUsage >= 70 && calorieUsage <= 100) score += 15;

  // Ensure score doesn't go below 0
  return Math.max(0, Math.round(score));
};

export default {
  NUTRITION_RULES,
  computeNutritionConstraints,
  getNutritionRules,
  validateRecipeConstraints,
  calculateRecipeScore,
};
