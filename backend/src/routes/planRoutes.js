import express from 'express';
import planController from '../controllers/planController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate a new weekly plan (requires auth)
router.post('/generate', verifyToken, planController.generatePlan);

// Get last 10 plans
router.get('/my', verifyToken, planController.getMyPlans);

// Get latest plan
router.get('/latest', verifyToken, planController.getLatestPlan);

export default router;
