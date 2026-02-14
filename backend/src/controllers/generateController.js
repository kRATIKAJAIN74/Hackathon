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

  // validate some fields
  if (!profile.mealsPerDay) profile.mealsPerDay = 3;

  const plan = await generateSmartWeeklyPlan(profile);

  // If user authenticated, save to DB (bonus)
  const userId = req.user?.userId;
  let saved = null;
  if (userId) {
    const p = new Plan({ user: userId, days: plan.week.map(d => ({ date: new Date(), meals: d.meals })), meta: { ...plan.meta, profile } });
    saved = await p.save();
  }

  res.json({ success: true, plan, saved });
});

// Expert-style recipe recommendations (standalone endpoint)
export const recommendRecipesEndpoint = catchAsync(async (req, res) => {
  const payload = req.body || {};

  // Collect and infer targets
  const facts = collectFacts(payload);
  const targets = inference.inferTargets(facts);

  // Build a search query from preferences or goal
  const query = (payload.preferences && payload.preferences.length) ? payload.preferences.join(' ') : (facts.goal || 'healthy');

  // Fetch candidates from RecipeDB (safe fallback inside service)
  const raw = await recipeDb.searchRecipes({
    searchTerm: query,
    dietType: payload.dietType,
    allergies: payload.allergies || [],
    limit: 20,
    // Provide a postFilter so the service can adaptively fetch more pages if too few results
    postFilter: (items) => filterEngine.filterRecipes(items || [], targets, facts),
    minResults: 12,
  });

  // Log what we received from recipe service for debugging (length and sample ids)
  try {
    if (Array.isArray(raw)) {
      console.log(`generateController.recommendRecipesEndpoint: received ${raw.length} candidate recipes`);
      const sample = raw.slice(0, 5).map(r => r.id || r.name).join(', ');
      console.log(`generateController.recommendRecipesEndpoint: sample ids/names: ${sample}`);
    } else {
      console.log('generateController.recommendRecipesEndpoint: received non-array response', typeof raw);
    }
  } catch (e) {
    console.warn('generateController logging failed', e.message || e);
  }

  // Filter locally using expert-system heuristics (ensure shaped data)
  const filtered = filterEngine.filterRecipes(raw || [], targets, facts);

  // Score the remaining recipes
  const scored = scoringEngine.scoreRecipes(filtered, targets, facts);

  // Return top N
  const top = scored.slice(0, 12).map(s => ({ recipe: s.recipe, score: s.score }));

  res.json({ success: true, recommendations: top, meta: { count: top.length, targets } });
});

export default {
  generatePlanEndpoint,
  recommendRecipesEndpoint,
};
