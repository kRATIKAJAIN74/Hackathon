/**
 * Scoring engine: rank recipes by calorie match, protein, sodium/sugar for diseases.
 * Returns { recipe, score, reasons } for explainable recommendations.
 */

const toNum = (v, def = 0) => {
  if (v == null) return def;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : def;
};

const scoreByCalorieMatch = (recipeCalories, targetCalories) => {
  const cals = toNum(recipeCalories, 0);
  const target = toNum(targetCalories, 1);
  const diff = Math.abs(cals - target);
  return Math.max(0, 1 - diff / Math.max(1, target));
};

const scoreByProtein = (recipeProtein, targetProteinPerMeal) => {
  const p = toNum(recipeProtein, 0);
  const t = Math.max(1, toNum(targetProteinPerMeal, 1));
  return Math.min(1, p / t);
};

/**
 * Returns { recipe, score, reasons }.
 * reasons: short strings explaining why the recipe was scored (e.g. "Good calorie match", "High protein").
 */
export const scoreRecipes = (recipes = [], targets = {}, facts = {}) => {
  const list = Array.isArray(recipes) ? recipes : [];
  const t = targets && typeof targets === 'object' ? targets : {};
  const f = facts && typeof facts === 'object' ? facts : {};

  const adjustedCalories = toNum(t.adjustedCalories, 2000);
  const proteinGrams = toNum(t.proteinGrams, 50);
  const perMealTarget = Math.round(adjustedCalories * 0.3);
  const targetProteinPerMeal = Math.round(proteinGrams * 0.25);

  const diseases = Array.isArray(f.diseases) ? f.diseases.map((d) => String(d).toLowerCase()) : [];
  const dietType = (f.dietType && String(f.dietType).toLowerCase()) || '';
  const hasDiabetes = diseases.some((d) => d.includes('diabetes'));
  const hasHypertension = diseases.some((d) => d.includes('hypertension') || d.includes('blood pressure'));

  const scored = list.map((r) => {
    if (!r || typeof r !== 'object') {
      return { recipe: r, score: 0, reasons: ['Invalid recipe'] };
    }

    const cals = toNum(r.nutrition?.calories ?? r.calories, 0);
    const protein = toNum(r.nutrition?.protein ?? r.protein, 0);
    const sodium = toNum(r.nutrition?.sodium ?? r.sodium, 0);
    const sugar = toNum(r.nutrition?.sugar ?? r.sugar, 0);
    const tags = Array.isArray(r.tags) ? r.tags.map((x) => String(x).toLowerCase()) : [];

    const reasons = [];
    let score = 0;

    const calScore = scoreByCalorieMatch(cals, perMealTarget);
    score += calScore * 4;
    if (calScore >= 0.7) reasons.push('Good calorie match for a main meal');
    else if (calScore >= 0.4) reasons.push('Reasonable calorie range');

    const proteinScore = scoreByProtein(protein, targetProteinPerMeal);
    score += proteinScore * 3;
    if (proteinScore >= 0.8) reasons.push('High protein');
    else if (proteinScore >= 0.5) reasons.push('Moderate protein');

    if (hasHypertension && sodium > 0) {
      if (sodium <= 400) {
        score += 1;
        reasons.push('Low sodium (good for blood pressure)');
      } else if (sodium > 600) {
        score -= 1;
        reasons.push('High sodium');
      }
    }

    if (hasDiabetes && sugar > 0) {
      if (sugar <= 15) {
        score += 0.5;
        reasons.push('Lower sugar');
      } else if (sugar > 25) {
        score -= 0.5;
        reasons.push('Higher sugar');
      }
    }

    if (dietType && tags.some((tag) => tag.includes(dietType) || dietType.includes(tag))) {
      score += 1;
      reasons.push(`Matches ${dietType} preference`);
    }

    if (reasons.length === 0) reasons.push('Matches basic nutrition targets');

    return { recipe: r, score: Math.max(0, Math.round(score * 10) / 10), reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
};

export default { scoreRecipes };
