// Filter recipes locally based on nutrition and diet/allergy constraints

const withinRange = (value = 0, target = 0, tolerance = 0.25) => {
  const min = target * (1 - tolerance);
  const max = target * (1 + tolerance);
  return value >= min && value <= max;
};

export const filterRecipes = (recipes = [], targets = {}, facts = {}) => {
  const { proteinGrams, carbsGrams, fatsGrams, adjustedCalories, diseaseConstraints } = targets;

  return recipes.filter(r => {
    // Normalize fields
    const cals = r.nutrition?.calories || 0;
    const protein = r.nutrition?.protein || 0;
    const carbs = r.nutrition?.carbs || 0;
    const fats = r.nutrition?.fat || 0;

    // Allergy safety
    if (facts.allergies && facts.allergies.length) {
      const allergenLower = (r.allergens || []).map(a => a.toLowerCase());
      if (allergenLower.some(a => facts.allergies.includes(a))) return false;
    }

    // Diet type flags
    if (facts.dietType) {
      const dt = facts.dietType.toLowerCase();
      if (dt.includes('vegan') && !(r.tags || []).includes('vegan')) return false;
      if (dt.includes('vegetarian') && !((r.tags || []).includes('vegetarian') || (r.tags || []).includes('vegan'))) return false;
    }

    // Calorie per meal: allow 30% tolerance
    if (!withinRange(cals, adjustedCalories * 0.3, 0.6)) return false; // meal should be around 30% of daily

    // Protein: prefer at least 20% of daily protein per main meal
    if (protein < Math.max(10, Math.round(targets.proteinGrams * 0.25))) return false;

    // Disease constraints
    if (diseaseConstraints && diseaseConstraints.carbRatioMax) {
      // approximate carb calories
      const carbCalories = carbs * 4;
      const carbRatio = carbCalories / Math.max(1, cals);
      if (carbRatio > diseaseConstraints.carbRatioMax) return false;
    }

    return true;
  });
};

export default { filterRecipes };
