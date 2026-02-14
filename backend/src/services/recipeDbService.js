import axios from 'axios';
import mockRecipes from '../data/mockRecipes.js';

// Read base URL and API key from environment for security
const BASE_URL = process.env.RECIPE_BASE_URL || 'http://localhost:6969';
const API_KEY = process.env.RECIPE_API_KEY || '';

// Simple in-memory cache to avoid frequent remote calls and respect rate limits.
// Structure: Map<string, { expiresAt: number, data: any }>
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Create axios instance with base URL. Authorization header is set per-request using API_KEY.
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Helper: build URLSearchParams from options. This centralizes query construction.
export const buildRecipeQuery = (options = {}) => {
  const params = new URLSearchParams();
  const { dietType, allergies = [], page = 1, limit = 20, searchTerm } = options;

  if (searchTerm) params.append('q', searchTerm);
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));

  // When vegetarian is requested, prefer to exclude obvious non-veg markers.
  // Many recipe APIs don't expose structured "isVegetarian" flags in search filters,
  // so we send a hint via a diet param and rely on local filtering as well.
  if (dietType) params.append('diet', dietType);

  // Pass allergies as a comma-separated exclusion list if supported by API.
  if (allergies && allergies.length) params.append('excludeIngredients', allergies.join(','));

  return params;
};

// Fetch several pages of recipes and merge results. Handles Authorization and retries.
export const fetchBulkRecipes = async (options = {}) => {
  const pagesToFetch = options.pages || 3;
  const perPage = options.limit || 20;
  const results = [];

  // Perform page requests sequentially to be gentle on rate limits.
  for (let p = 1; p <= pagesToFetch; p += 1) {
    const params = buildRecipeQuery({ ...options, page: p, limit: perPage, searchTerm: options.searchTerm });
    try {
      const resp = await apiClient.get('/recipe2-api/recipe/recipesinfo', {
        params,
        headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
      });

      if (resp?.data && Array.isArray(resp.data.results)) {
        // Log page-level success for diagnostics (shows API is reachable and returning data)
        console.log(`recipeDbService.fetchBulkRecipes: page ${p} returned ${resp.data.results.length} items`);
        results.push(...resp.data.results);
      } else if (resp?.data && Array.isArray(resp.data)) {
        // some APIs return array directly
        console.log(`recipeDbService.fetchBulkRecipes: page ${p} returned array (${resp.data.length})`);
        results.push(...resp.data);
      }
    } catch (err) {
      // Log and continue; if all pages fail we'll throw after loop
      console.warn(`RecipeDB page ${p} fetch failed:`, err.message || err);
    }
  }

  if (results.length === 0) {
    const e = new Error('RecipeDB API unavailable or returned no data');
    e.code = 'RECIPE_API_FAIL';
    throw e;
  }

  return results;
};

// Normalize raw recipe objects to a consistent structure used by the filter/scoring engines.
const normalize = (r) => {
  const nutrition = r.nutrition || r.nutrients || {};
  return {
    id: r.id || r._id || r.recipeId || r.name,
    name: r.name || r.title || r.recipe_name || 'Recipe',
    nutrition: {
      calories: Number(nutrition.calories || nutrition.energy || 0),
      protein: Number(nutrition.protein || nutrition.proteins || 0),
      fat: Number(nutrition.fat || nutrition.fats || 0),
      carbs: Number(nutrition.carbs || nutrition.carbohydrates || 0),
    },
    tags: (r.tags || []).map((t) => String(t).toLowerCase()),
    allergens: (r.allergens || r.allergy || []).map((a) => String(a).toLowerCase()),
    raw: r,
  };
};

// Search recipes with caching and adaptive fetching support.
// options: { searchTerm, dietType, allergies, page, limit, postFilter: function }
export const searchRecipes = async (options = {}) => {
  const keyParts = [options.searchTerm || '', options.dietType || '', (options.allergies || []).join(','), options.limit || 20].join('|');
  const cacheKey = `recipes:${keyParts}`;

  // Return cached result when available to reduce API calls and improve performance.
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Try remote API first. If it fails entirely, fallback to local mock dataset.
  let candidates = [];
  try {
    const raw = await fetchBulkRecipes({ ...options, pages: options.pages || 3 });
    candidates = raw.map(normalize);
    console.log(`recipeDbService.searchRecipes: fetched ${candidates.length} candidates from remote API (key=${cacheKey})`);
  } catch (err) {
    console.warn('Remote RecipeDB failed, using mock data. Error:', err.message || err);
    // Use local mock recipes as a last-resort fallback to keep UX functional offline.
    candidates = mockRecipes.map(normalize);
    // cache the fallback briefly to avoid repeated failures
    console.log(`recipeDbService.searchRecipes: using mockRecipes fallback (count=${candidates.length})`);
    cache.set(cacheKey, { data: candidates, expiresAt: Date.now() + 1000 * 60 });
    return candidates;
  }

  // If caller provided a postFilter function, we can apply adaptive fetching.
  // Adaptive fetching: fetch more pages if the filtered set is too small.
  if (typeof options.postFilter === 'function') {
    // Initial filtering locally because many APIs can't express per-meal/calorie constraints.
    let filtered = options.postFilter(candidates);
    console.log(`recipeDbService.searchRecipes: postFilter initial results=${filtered.length}`);

    // If fewer than threshold, fetch more pages to expand candidate pool.
    if (filtered.length < (options.minResults || 10)) {
      try {
        const more = await fetchBulkRecipes({ ...options, pages: (options.pages || 3) + 2 });
        const moreNorm = more.map(normalize);
        console.log(`recipeDbService.searchRecipes: adaptive fetch returned ${moreNorm.length} additional items`);
        // merge unique
        const map = new Map();
        candidates.concat(moreNorm).forEach((c) => map.set(c.id, c));
        candidates = Array.from(map.values());
        // re-filter after expanding pool
        filtered = options.postFilter(candidates);
        console.log(`recipeDbService.searchRecipes: postFilter after adaptive fetch results=${filtered.length}`);
      } catch (err) {
        console.warn('Adaptive fetch additional pages failed:', err.message || err);
      }
    }
  }

  // Cache normalized candidate list to reduce load and latency.
  cache.set(cacheKey, { data: candidates, expiresAt: Date.now() + CACHE_TTL });

  return candidates;
};

export const getRecipeDay = async (params = {}) => {
  try {
    const resp = await apiClient.get('/recipe2-api/recipe/recipe-day/with-ingredients-categories', {
      params: buildRecipeQuery(params),
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });
    return resp?.data?.day || null;
  } catch (err) {
    console.warn('getRecipeDay failed, returning null:', err.message || err);
    return null;
  }
};

export const getNutritionInfo = async (recipeId) => {
  try {
    const resp = await apiClient.get('/recipe2-api/recipe-nutri/nutritioninfo', {
      params: { id: recipeId },
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });
    return resp?.data || null;
  } catch (err) {
    console.warn('getNutritionInfo failed:', err.message || err);
    return null;
  }
};

export default {
  buildRecipeQuery,
  fetchBulkRecipes,
  searchRecipes,
  getRecipeDay,
  getNutritionInfo,
};
