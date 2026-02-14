import React from 'react';
import PropTypes from 'prop-types';
import { FiHeart } from 'react-icons/fi';

const RecipeCard = ({ recipe = {}, isFavorite = false, onFavoriteToggle = () => {} }) => {
  // Helper to safely format numbers. Defensive rendering prevents runtime crashes
  // when external APIs return missing or malformed nutrition fields.
  const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined) return 'N/A';
    const n = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(n)) return 'N/A';
    // toFixed returns a string; trim unnecessary .0 when decimals === 0
    const s = n.toFixed(decimals);
    return decimals === 0 ? String(Math.round(Number(s))) : s;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden h-full flex flex-col">
      {/* Image */}
      {recipe?.imageUrl && (
        <div className="relative h-48 bg-gradient-to-br from-primary to-secondary overflow-hidden">
          <img
            src={recipe.imageUrl}
            alt={recipe?.name || 'Recipe image'}
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
          {recipe?.score != null && (
            <div className={`absolute bottom-3 left-3 text-2xl font-bold ${getScoreColor(recipe.score)}`}>
              {formatNumber(recipe.score, 0)}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{recipe?.name || 'Untitled recipe'}</h3>

        {recipe?.reasoning && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{recipe.reasoning}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(recipe?.difficulty)}`}>
            {recipe?.difficulty || 'unknown'}
          </span>
          {recipe?.cuisineType && (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
              {recipe.cuisineType}
            </span>
          )}
        </div>

        {/* Nutrition Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(recipe?.nutrition?.calories, 0)} {formatNumber(recipe?.nutrition?.calories, 0) === 'N/A' ? '' : 'cal'}
            </div>
            <div className="text-xs text-gray-500">Calories</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(recipe?.nutrition?.protein, 1)} {formatNumber(recipe?.nutrition?.protein, 1) === 'N/A' ? '' : 'g'}
            </div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(recipe?.nutrition?.sugar, 1)} {formatNumber(recipe?.nutrition?.sugar, 1) === 'N/A' ? '' : 'g'}
            </div>
            <div className="text-xs text-gray-500">Sugar</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              {formatNumber(recipe?.nutrition?.sodium, 0)} {formatNumber(recipe?.nutrition?.sodium, 0) === 'N/A' ? '' : 'mg'}
            </div>
            <div className="text-xs text-gray-500">Sodium</div>
          </div>
        </div>

        {/* Timing */}
        {recipe?.totalTime > 0 && (
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
