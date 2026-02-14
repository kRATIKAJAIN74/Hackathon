import mockRecipes from '../data/mockRecipes.js';

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const matchesDiet = (recipe, dietType) => {
  if (!dietType) return true;
  const normalized = dietType.toLowerCase();
  if (normalized === 'vegan') return recipe.tags.includes('vegan');
  if (normalized === 'vegetarian') return recipe.tags.includes('vegetarian') || recipe.tags.includes('vegan');
  if (normalized === 'non-vegetarian' || normalized === 'non_vegetarian') return recipe.tags.includes('non_vegetarian') || !recipe.tags.includes('vegan');
  if (normalized === 'keto') return recipe.tags.includes('keto') || recipe.tags.includes('low-carb');
  if (normalized === 'low-carb') return recipe.tags.includes('low-carb') || recipe.tags.includes('keto');
  if (normalized === 'high-protein') return recipe.tags.includes('high-protein');
  return true;
};

const isAllergySafe = (recipe, allergies = []) => {
  if (!allergies || allergies.length === 0) return true;
  const lowerAll = allergies.map(a => a.toLowerCase());
  return !recipe.allergens.some(a => lowerAll.includes(a.toLowerCase()));
};

const matchesPreferences = (recipe, preferences = []) => {
  if (!preferences || preferences.length === 0) return true;
  const prefs = preferences.map(p => p.toLowerCase());
  return prefs.includes(recipe.cuisineType?.toLowerCase()) || prefs.some(p => recipe.tags.map(t=>t.toLowerCase()).includes(p));
};

const filterPool = (profile) => {
  const { dietType, allergies, preferences } = profile || {};
  return mockRecipes.filter(r => matchesDiet(r, dietType) && isAllergySafe(r, allergies) && matchesPreferences(r, preferences));
};

const selectMealForCalories = (pool, targetCalories, flexibility = 0.25) => {
  if (pool.length === 0) return null;
  const min = Math.max(0, targetCalories * (1 - flexibility));
  const max = targetCalories * (1 + flexibility);
  const candidates = pool.filter(r => r.nutrition.calories >= min && r.nutrition.calories <= max);
  const pick = candidates.length ? pickRandom(candidates) : pickRandom(pool);
  return pick;
};

/**
 * Generate a weekly plan (7 days) using the mock recipe pool
 * Profile should contain: goal, dietType, allergies, dailyCalorieTarget, activityLevel, mealsPerDay, preferences
 */
export const generateWeeklyPlan = (profile = {}) => {
  const dailyTarget = profile.dailyCalorieTarget || 2000;
  const mealsPerDay = profile.mealsPerDay || 3;
  const pool = filterPool(profile);

  // aim per meal
  const perMeal = Math.max(100, Math.round(dailyTarget / Math.max(1, mealsPerDay)));
  const snackTarget = Math.round(perMeal / 2);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = {
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
    };

    // Breakfast
    const breakfast = selectMealForCalories(pool, perMeal);
    if (breakfast) day.meals.breakfast.push(breakfast);

    // Lunch
    const lunch = selectMealForCalories(pool, perMeal);
    if (lunch) day.meals.lunch.push(lunch);

    // Dinner
    const dinner = selectMealForCalories(pool, perMeal);
    if (dinner) day.meals.dinner.push(dinner);

    // Snacks - add 1-2 snacks depending on calories
    const snackCount = mealsPerDay > 3 ? 1 : 1;
    for (let s = 0; s < snackCount; s++) {
      const snack = selectMealForCalories(pool, snackTarget, 0.5);
      if (snack) day.meals.snacks.push(snack);
    }

    days.push(day);
  }

  const macrosSummary = days.reduce((acc, d) => {
    const meals = [...d.meals.breakfast, ...d.meals.lunch, ...d.meals.dinner, ...d.meals.snacks];
    meals.forEach(m => {
      acc.calories += m.nutrition.calories || 0;
      acc.protein += m.nutrition.protein || 0;
      acc.carbs += m.nutrition.carbs || 0;
      acc.fat += m.nutrition.fat || 0;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return {
    meta: {
      goal: profile.goal || 'general_fitness',
      dietType: profile.dietType || null,
      allergies: profile.allergies || [],
      dailyCalorieTarget: dailyTarget,
      activityLevel: profile.activityLevel || 'moderate',
      mealsPerDay: mealsPerDay,
      preferences: profile.preferences || [],
    },
    days,
    macrosSummary,
  };
};

export default {
  generateWeeklyPlan,
};
