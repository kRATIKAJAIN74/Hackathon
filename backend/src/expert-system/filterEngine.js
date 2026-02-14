/**
 * Filter recipes by per-meal calories, diet type, allergies, and disease constraints.
 * Defensive: never assume numeric values or array existence; missing targets skip that check.
 */

const toNum = (v, def = 0) => {
  if (v == null) return def;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : def;
};

const withinRange = (value, target, tolerance = 0.35) => {
  const val = toNum(value, 0);
  const t = toNum(target, 0);
  if (t <= 0) return true;
  const min = t * (1 - tolerance);
  const max = t * (1 + tolerance);
  return val >= min && val <= max;
};

export const filterRecipes = (recipes = [], targets = {}, facts = {}) => {
  const list = Array.isArray(recipes) ? recipes : [];
  const t = targets && typeof targets === 'object' ? targets : {};
  const f = facts && typeof facts === 'object' ? facts : {};

  const adjustedCalories = toNum(t.adjustedCalories, 0);
  const proteinGrams = toNum(t.proteinGrams, 0);
  const diseaseConstraints = t.diseaseConstraints && typeof t.diseaseConstraints === 'object' ? t.diseaseConstraints : {};
  const perMealCalories = adjustedCalories > 0 ? adjustedCalories * 0.3 : 0;
  const minProteinPerMeal = Math.max(10, Math.round(proteinGrams * 0.25));

  const allergies = Array.isArray(f.allergies) ? f.allergies.map((a) => String(a).toLowerCase()) : [];
  const dietType = (f.dietType && String(f.dietType).toLowerCase()) || '';

  return list.filter((r) => {
    if (!r || typeof r !== 'object') return false;

    const cals = toNum(r.nutrition?.calories ?? r.calories, 0);
    const protein = toNum(r.nutrition?.protein ?? r.protein, 0);
    const carbs = toNum(r.nutrition?.carbs ?? r.carbs, 0);
    const tags = Array.isArray(r.tags) ? r.tags.map((x) => String(x).toLowerCase()) : [];
    const allergens = Array.isArray(r.allergens) ? r.allergens.map((a) => String(a).toLowerCase()) : [];

    // Allergy: exclude if any user allergy appears in recipe allergens
    if (allergies.length > 0) {
      if (allergens.some((a) => allergies.some((u) => a.includes(u) || u.includes(a)))) return false;
    }

    // Diet type
    if (dietType) {
      if (dietType.includes('vegan') && !tags.some((t) => t.includes('vegan'))) return false;
      if (dietType.includes('vegetarian') && !tags.some((t) => t.includes('vegetarian') || t.includes('vegan'))) return false;
    }

    // Per-meal calorie band (only when we have a target)
    if (perMealCalories > 0 && !withinRange(cals, perMealCalories, 0.5)) return false;

    // Minimum protein per main meal
    if (protein < minProteinPerMeal) return false;

    // Disease: carb ratio (e.g. diabetes)
    const carbRatioMax = toNum(diseaseConstraints.carbRatioMax, 1);
    if (carbRatioMax < 1 && cals > 0) {
      const carbCalories = carbs * 4;
      const carbRatio = carbCalories / cals;
      if (carbRatio > carbRatioMax) return false;
    }

    return true;
  });
};

export default { filterRecipes };
