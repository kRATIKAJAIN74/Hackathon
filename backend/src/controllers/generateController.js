import { generateSmartWeeklyPlan } from '../services/planGenerator.js';
import { Plan } from '../models/Plan.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import recipeDb from '../services/recipeDbService.js';
import { collectFacts } from '../expert-system/factCollector.js';
import inference from '../expert-system/inferenceEngine.js';
import filterEngine from '../expert-system/filterEngine.js';
import scoringEngine from '../expert-system/scoringEngine.js';

export const generatePlanEndpoint = catchAsync(async (req, res) => {
  const profile = req.body || {};

  if (!profile.mealsPerDay) profile.mealsPerDay = 3;

  const plan = await generateSmartWeeklyPlan(profile);

  const userId = req.user?.userId;
  let saved = null;
  if (userId) {
    const p = new Plan({ user: userId, days: plan.week.map(d => ({ date: new Date(), meals: d.meals })), meta: { ...plan.meta, profile } });
    saved = await p.save();
  }

  res.json({ success: true, plan, saved });
});

/**
 * Build recommendation item for frontend: id, title, calories, protein, score, reasons.
 * Uses normalized recipe shape (flat calories/protein or nutrition.*).
 */
const toRecommendationItem = (scoredItem) => {
  const r = scoredItem?.recipe;
  const score = typeof scoredItem?.score === 'number' ? scoredItem.score : 0;
  const reasons = Array.isArray(scoredItem?.reasons) ? scoredItem.reasons : [];

  if (!r || typeof r !== 'object') {
    return { id: 'unknown', title: 'Unknown', calories: 0, protein: 0, score, reasons };
  }

  const calories = typeof r.calories === 'number' ? r.calories : (r.nutrition && typeof r.nutrition.calories === 'number') ? r.nutrition.calories : 0;
  const protein = typeof r.protein === 'number' ? r.protein : (r.nutrition && typeof r.nutrition.protein === 'number') ? r.nutrition.protein : 0;

  return {
    id: r.id ?? r.name ?? 'unknown',
    title: r.title ?? r.name ?? 'Recipe',
    image: r.image ?? r.imageUrl ?? null,
    calories,
    protein,
    score,
    reasons,
    recipe: r,
  };
};

export const recommendRecipesEndpoint = catchAsync(async (req, res) => {
  const payload = req.body || {};
  const debug = req.query?.debug === 'true' || req.query?.debug === '1';

  const facts = collectFacts(payload);
  const targets = inference.inferTargets(facts);

  const query = (payload.preferences && payload.preferences.length) ? payload.preferences.join(' ') : (facts.goal || 'healthy');

  let totalCandidates = 0;

  const fetchOptions = {
    searchTerm: query,
    dietType: payload.dietType,
    allergies: payload.allergies || [],
    limit: 20,
    minResults: 12,
    postFilter: (items) => filterEngine.filterRecipes(items || [], targets, facts),
  };

  if (debug) {
    fetchOptions.pages = 2;
  }

  const raw = await recipeDb.searchRecipes(fetchOptions);
  totalCandidates = Array.isArray(raw) ? raw.length : 0;

  const filtered = filterEngine.filterRecipes(raw || [], targets, facts);
  const filteredCount = filtered.length;

  const scored = scoringEngine.scoreRecipes(filtered, targets, facts);
  const top = scored.slice(0, 12);
  const recommendations = top.map(toRecommendationItem);

  if (debug) {
    return res.json({
      success: true,
      debug: {
        remoteSucceeded: totalCandidates > 0,
        totalCandidates,
        filteredCount,
        recommendationsReturned: recommendations.length,
        baseUrlConfigured: Boolean(process.env.RECIPE_BASE_URL),
        hasApiKey: Boolean(process.env.RECIPE_API_KEY),
      },
      targets,
      totalCandidates,
      filteredCount,
      recommendations,
    });
  }

  res.json({
    success: true,
    targets,
    totalCandidates,
    filteredCount,
    recommendations,
  });
});

export default {
  generatePlanEndpoint,
  recommendRecipesEndpoint,
};
