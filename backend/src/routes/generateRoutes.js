import express from 'express';
import generateController from '../controllers/generateController.js';
import { optionalVerifyToken } from '../middleware/auth.js';

const router = express.Router();

// Allow both unauthenticated and authenticated requests. If token present and valid, route will save plan.
router.post('/generate-plan', optionalVerifyToken, generateController.generatePlanEndpoint);
router.post('/expert/recommend', generateController.recommendRecipesEndpoint);

export default router;
