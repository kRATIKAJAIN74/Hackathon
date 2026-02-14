import recipeDb from './recipeDbService.js';
import mockRecipes from '../data/mockRecipes.js';

// Scoring weights (tunable)
const WEIGHTS = {
  protein: 3,
  calories: 2,
  dietMatch: 4,
  goalAlign: 3,
};

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const normalize = (r) => ({
  id: r.id || r._id || r.name,
  name: r.name || r.title || 'Recipe',
  nutrition: r.nutrition || r.nutrients || { calories: r.calories || 0, protein: r.protein || 0, carbs: r.carbs || 0, fat: r.fat || 0 },
  tags: (r.tags || []).map(t => t.toLowerCase()),
  allergens: (r.allergens || []).map(a => a.toLowerCase()),
});

const mapGoalToMacroPrefs = (goal) => {
  const g = (goal || '').toLowerCase();
  if (g.includes('weight loss')) return { protein: 'high', carbs: 'moderate', caloriesMultiplier: 0.85 };
  if (g.includes('muscle')) return { protein: 'high', carbs: 'normal', caloriesMultiplier: 1.15 };
  if (g.includes('diabetes')) return { protein: 'normal', carbs: 'low', caloriesMultiplier: 0.95 };
  if (g.includes('pcos')) return { protein: 'normal', carbs: 'low', caloriesMultiplier: 0.95 };
  if (g.includes('weight gain')) return { protein: 'normal', carbs: 'normal', caloriesMultiplier: 1.2 };
  return { protein: 'normal', carbs: 'normal', caloriesMultiplier: 1.0 };
};

const dietMatches = (recipe, dietType) => {
  if (!dietType) return true;
  const d = dietType.toLowerCase();
  if (d.includes('vegan')) return recipe.tags.includes('vegan');
  if (d.includes('vegetarian')) return recipe.tags.includes('vegetarian') || recipe.tags.includes('vegan');
  if (d.includes('keto')) return recipe.tags.includes('keto') || recipe.tags.includes('low-carb');
  if (d.includes('non')) return recipe.tags.includes('non_vegetarian') || recipe.tags.includes('non-vegetarian');
  if (d.includes('high-protein')) return recipe.tags.includes('high-protein');
  return true;
};

const isAllergySafe = (recipe, allergies=[]) => {
  if (!allergies || allergies.length === 0) return true;
  const lower = allergies.map(a => a.toLowerCase());
  return !recipe.allergens.some(a => lower.includes(a));
};

const scoreRecipe = (recipe, profile, targetCaloriesPerMeal) => {
  const r = normalize(recipe);
  let score = 0;

  // protein match: prefer higher protein if goal requires
  const protein = r.nutrition.protein || 0;
  const proteinScore = Math.min(1, protein / 30); // normalize
  score += proteinScore * WEIGHTS.protein;

  // calorie accuracy: closer to target better
  const c = r.nutrition.calories || 0;
  const calorieDiff = Math.abs(c - targetCaloriesPerMeal);
  const calorieScore = 1 - Math.min(1, calorieDiff / Math.max(1, targetCaloriesPerMeal));
  score += calorieScore * WEIGHTS.calories;

  // diet match
  const dietScore = dietMatches(r, profile.dietType) ? 1 : 0;
  score += dietScore * WEIGHTS.dietMatch;

  // goal alignment (simple heuristic)
  const prefs = mapGoalToMacroPrefs(profile.goal || '');
  let goalScore = 0;
  if (prefs.protein === 'high' && protein >= 20) goalScore += 1;
  if (prefs.carbs === 'low' && (r.nutrition.carbs || 0) <= 30) goalScore += 1;
  score += (goalScore/2) * WEIGHTS.goalAlign;

  return { score, recipe: r };
};

const uniqueById = (arr) => {
  const map = new Map();
  arr.forEach(a => map.set(a.id, a));
  return Array.from(map.values());
};

export const generateSmartWeeklyPlan = async (profile = {}) => {
  // fetch candidate recipes from RecipeDB (fallback to mock)
  const query = profile.preferences?.join(' ') || 'healthy';
  // Use the recipe service with a postFilter so the service can adaptively fetch more pages
  const remote = await recipeDb.searchRecipes({
    searchTerm: query,
    dietType: profile.dietType,
    allergies: profile.allergies || [],
    limit: 20,
    postFilter: (items) => items.filter(r => isAllergySafe(r, profile.allergies || []) && dietMatches(r, profile.dietType)),
    minResults: 21,
  });

  const candidates = (remote && remote.length) ? remote.map(normalize) : mockRecipes.map(normalize);

  // filter allergy-safe and diet (defensive, in case postFilter wasn't applied)
  const filtered = candidates.filter(r => isAllergySafe(r, profile.allergies || []) && dietMatches(r, profile.dietType));

  // prepare daily calorie split
  const dailyTarget = profile.dailyCalorieTarget || 2000;
  const goalPrefs = mapGoalToMacroPrefs(profile.goal || 'general');
  const adjustedDaily = Math.round(dailyTarget * (goalPrefs.caloriesMultiplier || 1));

  const distribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snacks: 0.10,
  };

  // meals per day may change how snacks are distributed; keep base structure
  const week = [];
  const usedIds = new Set();

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const dayName = DAY_NAMES[dayIdx % 7];
    const meals = { breakfast: null, lunch: null, dinner: null, snacks: [] };

    // for each meal slot, choose best-scoring candidate not used this week
    for (const slot of ['breakfast','lunch','dinner']) {
      const targetCalories = Math.round(adjustedDaily * distribution[slot]);
      const scores = filtered
        .filter(r => !usedIds.has(r.id))
        .map(r => scoreRecipe(r, profile, targetCalories));

      scores.sort((a,b) => b.score - a.score);
      const pick = scores.length ? scores[0].recipe : null;
      if (pick) { meals[slot] = pick; usedIds.add(pick.id); }
    }

    // snacks: try to pick 1-2 small items
    const snackTarget = Math.round(adjustedDaily * distribution.snacks);
    const snackCandidates = filtered.filter(r => !usedIds.has(r.id));
    const snackScores = snackCandidates.map(r => scoreRecipe(r, profile, snackTarget));
    snackScores.sort((a,b) => b.score - a.score);
    if (snackScores.length) {
      meals.snacks.push(snackScores[0].recipe); usedIds.add(snackScores[0].recipe.id);
      if (snackScores[1]) { meals.snacks.push(snackScores[1].recipe); usedIds.add(snackScores[1].recipe.id); }
    }

    // compute totals
    const items = [meals.breakfast, meals.lunch, meals.dinner, ...meals.snacks].filter(Boolean);
    const totalCalories = items.reduce((s,it) => s + (it.nutrition?.calories || 0), 0);
    const macros = items.reduce((acc,it) => {
      acc.protein += (it.nutrition?.protein || 0);
      acc.carbs += (it.nutrition?.carbs || 0);
      acc.fats += (it.nutrition?.fat || 0);
      return acc;
    }, { protein:0, carbs:0, fats:0 });

    week.push({ day: dayName, meals, totalCalories, macros });
  }

  // ensure uniqueness across week
  // already tracked by usedIds; if insufficient candidates, duplicates may still occur from initial filtered list

  return { week, meta: { generatedAt: new Date().toISOString(), profile, adjustedDaily } };
};

export default {
  generateSmartWeeklyPlan,
};
