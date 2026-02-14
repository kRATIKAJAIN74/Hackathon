// Scoring engine to rank recipes by suitability

const scoreByCalorieMatch = (recipeCalories, targetCalories) => {
  const diff = Math.abs(recipeCalories - targetCalories);
  return Math.max(0, 1 - (diff / Math.max(1, targetCalories)));
};

const scoreByProtein = (recipeProtein, targetProteinPerMeal) => {
  return Math.min(1, recipeProtein / Math.max(1, targetProteinPerMeal));
};

export const scoreRecipes = (recipes = [], targets = {}, facts = {}) => {
  const perMealTarget = Math.round(targets.adjustedCalories * 0.3); // main meal target
  const targetProteinPerMeal = Math.round(targets.proteinGrams * 0.25);

  const scored = recipes.map(r => {
    const cals = r.nutrition?.calories || 0;
    const protein = r.nutrition?.protein || 0;
    const sodium = r.nutrition?.sodium || 0;

    let score = 0;
    score += scoreByCalorieMatch(cals, perMealTarget) * 4; // weight
    score += scoreByProtein(protein, targetProteinPerMeal) * 3;

    // disease adjustments: penalize high sodium for cardio/diabetes
    if (facts.diseases && facts.diseases.includes('diabetes')) {
      const sodiumPenalty = sodium > 600 ? -1 : 0;
      score += sodiumPenalty;
    }

    // slight bonus for diet match
    if (facts.dietType && ((r.tags || []).includes(facts.dietType))) score += 1;

    return { recipe: r, score };
  });

  scored.sort((a,b) => b.score - a.score);
  return scored;
};

export default { scoreRecipes };
