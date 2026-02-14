import React from 'react';
import PropTypes from 'prop-types';
import { FiHeart } from 'react-icons/fi';

/**
 * Safe number formatter: prevents .toFixed() crash when value is undefined or non-numeric.
 * Returns 'N/A' for null, undefined, or non-finite values.
 */
const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return 'N/A';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return 'N/A';
  const s = Number(n).toFixed(decimals);
  return decimals === 0 ? String(Math.round(Number(s))) : s;
};

const RecipeCard = ({ recipe = {}, isFavorite = false, onFavoriteToggle = () => {} }) => {
  const getDifficultyColor = (difficulty) => {
    switch (String(difficulty).toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    const s = Number(score);
    if (!Number.isFinite(s)) return 'text-gray-600';
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    if (s >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!recipe || typeof recipe !== 'object') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <p className="text-gray-500">Recipe data unavailable</p>
      </div>
    );
  }

  const nut = recipe.nutrition ?? {};
  const calories = nut.calories ?? recipe.calories ?? 0;
  const protein = nut.protein ?? recipe.protein ?? 0;
  const sugar = nut.sugar ?? recipe.sugar ?? 0;
  const sodium = nut.sodium ?? recipe.sodium ?? 0;
  const title = recipe.title ?? recipe.name ?? 'Untitled recipe';
  const imageUrl = recipe.imageUrl ?? recipe.image ?? null;
  const score = recipe.score;
  const reasons = recipe.reasons;
  const hasReasons = Array.isArray(reasons) && reasons.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden h-full flex flex-col">
      {imageUrl ? (
        <div className="relative h-48 bg-gradient-to-br from-primary to-secondary overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition"
          />
          <div className="absolute top-3 right-3">
            <button
              onClick={onFavoriteToggle}
              className={`p-2 rounded-full transition ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-500 hover:text-red-500'
              }`}
            >
              <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          {score != null && (
            <div className={`absolute bottom-3 left-3 text-2xl font-bold ${getScoreColor(score)}`}>
              {formatNumber(score, 0)}
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-white/80 font-medium">{title}</span>
          {score != null && (
            <div className={`absolute bottom-2 left-3 text-xl font-bold text-white ${getScoreColor(score)}`}>
              {formatNumber(score, 0)}
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{title}</h3>

        {recipe.reasoning && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{recipe.reasoning}</p>
        )}
        {hasReasons && !recipe.reasoning && (
          <ul className="text-xs text-gray-600 mt-2 space-y-0.5 line-clamp-2">
            {reasons.slice(0, 2).map((reason, i) => (
              <li key={i}>• {reason}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty ?? 'unknown'}
          </span>
          {recipe.cuisineType && (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
              {recipe.cuisineType}
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(calories, 0)}{formatNumber(calories, 0) !== 'N/A' ? ' cal' : ''}
            </div>
            <div className="text-xs text-gray-500">Calories</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(protein, 1)}{formatNumber(protein, 1) !== 'N/A' ? ' g' : ''}
            </div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(sugar, 1)}{formatNumber(sugar, 1) !== 'N/A' ? ' g' : ''}
            </div>
            <div className="text-xs text-gray-500">Sugar</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(sodium, 0)}{formatNumber(sodium, 0) !== 'N/A' ? ' mg' : ''}
            </div>
            <div className="text-xs text-gray-500">Sodium</div>
          </div>
        </div>

        {recipe.totalTime > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            ⏱️ {formatNumber(recipe.totalTime, 0)} minutes
          </div>
        )}
      </div>
    </div>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.object,
  isFavorite: PropTypes.bool,
  onFavoriteToggle: PropTypes.func,
};

export default RecipeCard;
