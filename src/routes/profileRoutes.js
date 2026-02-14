import express from 'express';
import {
  setupProfile,
  updateProfile,
  getProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/profileController.js';
import { verifyToken, requireProfileCompletion } from '../middleware/auth.js';

const router = express.Router();

/**
 * All profile routes require authentication
 */
router.use(verifyToken);

/**
 * Profile setup (onboarding) - no need for profile completion
 */
router.post('/setup', setupProfile);

/**
 * Get profile
 */
router.get('/', getProfile);

/**
 * Update profile - requires profile completion
 */
router.put('/update', updateProfile);

/**
 * Favorites management - requires profile completion
 */
router.post('/favorites/add', addFavorite);
router.delete('/favorites/remove', removeFavorite);
router.get('/favorites', getFavorites);

export default router;
