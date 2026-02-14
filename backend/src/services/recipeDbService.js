/**
 * RecipeDB external API service (cosylab.iiitd.edu.in).
 * Uses RECIPE_BASE_URL and RECIPE_API_KEY from environment. Never defaults to localhost
 * in production; missing env results in clear startup log and safe fallback.
 */
import axios from 'axios';
import config from '../config/config.js';

// Centralized config: avoid hardcoded localhost so wrong env is visible at startup
const BASE_URL = config.recipeBaseUrl || process.env.RECIPE_BASE_URL || '';
const API_KEY = config.recipeApiKey || process.env.RECIPE_API_KEY || '';
const CACHE_TTL_MS = (config.cacheTtlSeconds || 300) * 1000;
const MAX_PAGES = 5;
const MIN_RESULTS_THRESHOLD = 10;

// In-memory cache: key = query signature (diet + allergies + goal), value = { expiresAt, data }
const cache = new Map();

const apiClient = axios.create({
  baseURL: BASE_URL || 'http://localhost:6969',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Structured log for diagnostics without spam. Use for success/failure of remote calls only.
 */
const log = (level, message, meta = {}) => {
  const payload = { message, ...meta, service: 'recipeDbService' };
  if (level === 'warn') console.warn(JSON.stringify(payload));
  else if (level === 'error') console.error(JSON.stringify(payload));
  else console.log(JSON.stringify(payload));
};

/**
 * Safe number conversion for API fields that may be string or missing.
 */
const toNum = (v, def = 0) => {
  if (v == null) return def;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * Normalize raw API recipe into a consistent internal schema.
 * Ensures frontend never receives undefined nutrition values; all numerics default to 0.
 * Maps multiple possible API field names (RecipeDB may use different keys per version).
 */
export const normalizeRecipe = (r) => {
  if (!r || typeof r !== 'object') {
    return {
      id: 'unknown',
      title: 'Unknown',
      name: 'Unknown',
      image: null,
      imageUrl: null,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      sugar: 0,
      sodium: 0,
      ingredients: [],
      nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, sodium: 0 },
      tags: [],
      allergens: [],
      raw: r,
    };
  }

  const nut = r.nutrition || r.nutrients || r.nutritional_info || {};
  const calories = toNum(nut.calories ?? nut.energy ?? nut.Calories ?? r.calories);
  const protein = toNum(nut.protein ?? nut.proteins ?? nut.Protein ?? r.protein);
  const fat = toNum(nut.fat ?? nut.fats ?? nut.Fat ?? r.fat);
  const carbs = toNum(nut.carbs ?? nut.carbohydrates ?? nut.Carbs ?? r.carbs);
  const sugar = toNum(nut.sugar ?? nut.Sugar ?? r.sugar);
  const sodium = toNum(nut.sodium ?? nut.Sodium ?? r.sodium);

  const id = r.id ?? r._id ?? r.recipeId ?? r.Recipe_id ?? String(r.name || 'unknown');
  const title = r.title ?? r.name ?? r.recipe_name ?? r.recipeName ?? 'Recipe';
  const image = r.image ?? r.imageUrl ?? r.img ?? r.photo ?? null;
  const ingredients = Array.isArray(r.ingredients)
    ? r.ingredients
    : Array.isArray(r.ingredient)
      ? r.ingredient
      : [];

  const tags = (r.tags || r.diet_labels || []).map((t) => String(t).toLowerCase());
  const allergens = (r.allergens || r.allergy || r.allergen || []).map((a) => String(a).toLowerCase());

  return {
    id: String(id),
    title: String(title),
    name: title,
    image: image || null,
    imageUrl: image || null,
    calories,
    protein,
    fat,
    carbs,
    sugar,
    sodium,
    ingredients,
    nutrition: { calories, protein, fat, carbs, sugar, sodium },
    tags,
    allergens,
    raw: r,
  };
};

export const buildRecipeQuery = (options = {}) => {
  const params = new URLSearchParams();
  const { dietType, allergies = [], page = 1, limit = 20, searchTerm } = options;

  if (searchTerm) params.append('q', searchTerm);
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (dietType) params.append('diet', dietType);
  if (allergies && allergies.length) params.append('excludeIngredients', allergies.join(','));

  return params;
};

/**
 * Fetch one or more pages from RecipeDB. Authorization header set per request.
 * Fails gracefully per page; throws only if all pages return no data.
 */
export const fetchBulkRecipes = async (options = {}) => {
  const pagesToFetch = Math.min(options.pages || 3, MAX_PAGES);
  const perPage = options.limit || 20;
  const results = [];
  const authHeader = API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {};

  for (let p = 1; p <= pagesToFetch; p += 1) {
    const params = buildRecipeQuery({ ...options, page: p, limit: perPage, searchTerm: options.searchTerm });
    try {
      const resp = await apiClient.get('/recipe2-api/recipe/recipesinfo', {
        params,
        headers: { ...authHeader },
      });

      const items = resp?.data?.results ?? (Array.isArray(resp?.data) ? resp.data : null);
      if (items && items.length > 0) {
        results.push(...items);
        log('info', `fetchBulkRecipes: page ${p} returned ${items.length} items`, { page: p, count: items.length });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || String(err);
      const code = err.code || err.response?.status;
      log('warn', `RecipeDB page ${p} fetch failed`, { page: p, error: msg, code });
    }
  }

  if (results.length === 0) {
    const e = new Error('RecipeDB API unavailable or returned no data');
    e.code = 'RECIPE_API_FAIL';
    log('error', 'fetchBulkRecipes: no results from any page', { pagesRequested: pagesToFetch });
    throw e;
  }

  return results;
};

/**
 * Safe fallback when remote API fails. Does not depend on data/mockRecipes.js
 * (which may be gitignored); avoids require() in ESM and keeps server stable.
 */
const getMockFallback = () => [
  {
    id: 'fallback-1',
    name: 'Sample Healthy Meal',
    nutrition: { calories: 400, protein: 25, fat: 15, carbs: 45, sugar: 5, sodium: 300 },
    tags: ['vegetarian'],
    allergens: [],
  },
];

/**
 * Cache key from query signature to avoid exceeding rate limits and improve latency.
 */
const cacheKey = (options) => {
  const diet = options.dietType || '';
  const allergies = (options.allergies || []).join(',');
  const goal = options.goal || options.searchTerm || '';
  const limit = options.limit || 20;
  return `recipes:${diet}|${allergies}|${goal}|${limit}`;
};

/**
 * Search recipes with caching and optional adaptive fetch.
 * If postFilter is provided and filtered count < minResults, fetches additional pages (up to MAX_PAGES).
 */
export const searchRecipes = async (options = {}) => {
  const key = cacheKey(options);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let candidates = [];
  try {
    const raw = await fetchBulkRecipes({ ...options, pages: options.pages || 3 });
    candidates = raw.map(normalizeRecipe);
    log('info', 'searchRecipes: fetched from remote API', { count: candidates.length, cacheKey: key });
  } catch (err) {
    log('warn', 'searchRecipes: using fallback after remote failure', { error: err.message || err.code });
    const mock = getMockFallback();
    candidates = mock.map(normalizeRecipe);
    cache.set(key, { data: candidates, expiresAt: Date.now() + 60000 });
    return candidates;
  }

  if (typeof options.postFilter === 'function') {
    let filtered = options.postFilter(candidates);
    const minResults = options.minResults ?? MIN_RESULTS_THRESHOLD;
    const pagesUsed = options.pages || 3;

    if (filtered.length < minResults && pagesUsed < MAX_PAGES) {
      try {
        const extraPages = Math.min(MAX_PAGES - pagesUsed, 2);
        const more = await fetchBulkRecipes({ ...options, pages: pagesUsed + extraPages });
        const moreNorm = more.map(normalizeRecipe);
        const byId = new Map();
        [...candidates, ...moreNorm].forEach((c) => byId.set(c.id, c));
        candidates = Array.from(byId.values());
        filtered = options.postFilter(candidates);
        log('info', 'searchRecipes: adaptive fetch applied', { filteredCount: filtered.length });
      } catch (e) {
        log('warn', 'searchRecipes: adaptive fetch failed', { error: e.message });
      }
    }
  }

  cache.set(key, { data: candidates, expiresAt: Date.now() + CACHE_TTL_MS });
  return candidates;
};

export const getRecipeDay = async (params = {}) => {
  const authHeader = API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {};
  try {
    const resp = await apiClient.get('/recipe2-api/recipe/recipe-day/with-ingredients-categories', {
      params: buildRecipeQuery(params),
      headers: { ...authHeader },
    });
    return resp?.data?.day ?? null;
  } catch (err) {
    log('warn', 'getRecipeDay failed', { error: err.message });
    return null;
  }
};

export const getNutritionInfo = async (recipeId) => {
  const authHeader = API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {};
  try {
    const resp = await apiClient.get('/recipe2-api/recipe-nutri/nutritioninfo', {
      params: { id: recipeId },
      headers: { ...authHeader },
    });
    return resp?.data ?? null;
  } catch (err) {
    log('warn', 'getNutritionInfo failed', { error: err.message });
    return null;
  }
};

/**
 * Call once at startup to log effective Recipe API config (no secrets).
 */
export const logRecipeConfig = () => {
  const url = BASE_URL || process.env.RECIPE_BASE_URL || '(none)';
  const hasKey = Boolean(API_KEY || process.env.RECIPE_API_KEY);
  log('info', 'Recipe API config', { baseUrl: url, hasApiKey: hasKey });
};

export default {
  buildRecipeQuery,
  fetchBulkRecipes,
  searchRecipes,
  getRecipeDay,
  getNutritionInfo,
  normalizeRecipe,
  logRecipeConfig,
};
