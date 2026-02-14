import { GOAL_RULES, DISEASE_RULES } from './knowledgeBase.js';

// Mifflin-St Jeor BMR
export const calculateBMR = ({ age, weight, height, sex = 'male' }) => {
  // Using male as default; sex can be passed for more accuracy
  const s = (sex === 'female') ? -161 : 5;
  // weight in kg, height in cm
  return Math.round((10 * weight) + (6.25 * height) - (5 * age) + s);
};

export const activityMultiplier = (level = 'moderate') => {
  switch (level) {
    case 'sedentary': return 1.2;
    case 'moderate': return 1.55;
    case 'active': return 1.75;
    default: return 1.55;
  }
};

export const inferTargets = (facts) => {
  const bmr = calculateBMR(facts);
  const tdee = Math.round(bmr * activityMultiplier(facts.activityLevel));

  const goalRule = GOAL_RULES[facts.goal] || GOAL_RULES.general;
  // Apply calorie multiplier from goal
  const adjustedCalories = Math.round(tdee * (goalRule.calorieMultiplier || 1));

  // base macro split defaults
  const proteinRatio = goalRule.proteinRatio || 0.2; // portion of calories
  const carbsRatio = goalRule.carbLimitRatio || 0.45;
  const fatsRatio = 1 - (proteinRatio + carbsRatio);

  // per meal distribution
  const distribution = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snacks: 0.10 };

  // Disease constraints merged
  const diseaseConstraints = {};
  facts.diseases.forEach(d => {
    const rule = DISEASE_RULES[d];
    if (rule) Object.assign(diseaseConstraints, rule);
  });

  // Derive numeric targets
  const targets = {
    bmr,
    tdee,
    adjustedCalories,
    proteinCalories: Math.round(adjustedCalories * proteinRatio),
    carbsCalories: Math.round(adjustedCalories * carbsRatio),
    fatsCalories: Math.round(adjustedCalories * fatsRatio),
    proteinGrams: Math.round((adjustedCalories * proteinRatio) / 4),
    carbsGrams: Math.round((adjustedCalories * carbsRatio) / 4),
    fatsGrams: Math.round((adjustedCalories * fatsRatio) / 9),
    distribution,
    diseaseConstraints,
  };

  return targets;
};

export default { calculateBMR, activityMultiplier, inferTargets };
