// Knowledge base rules and constraints

export const GOAL_RULES = {
  weight_loss: {
    calorieMultiplier: 0.85,
    proteinRatio: 0.30, // 30% calories from protein
  },
  muscle_gain: {
    calorieMultiplier: 1.15,
    proteinRatio: 0.30,
  },
  diabetes: {
    calorieMultiplier: 0.95,
    carbLimitRatio: 0.35,
  },
  cholesterol: {
    calorieMultiplier: 1.0,
    fatLimitRatio: 0.25,
  },
  general: {
    calorieMultiplier: 1.0,
  },
};

// Disease rules can override or add stricter constraints
export const DISEASE_RULES = {
  diabetes: {
    carbRatioMax: 0.35,
    sugarMaxPerMeal: 15, // grams
  },
  high_cholesterol: {
    fatRatioMax: 0.25,
    saturatedFatMaxPerMeal: 10,
  },
};

export default { GOAL_RULES, DISEASE_RULES };
