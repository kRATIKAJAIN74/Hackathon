import { Plan } from '../models/Plan.js';
import { User } from '../models/User.js';
import { generateWeeklyPlan } from '../services/planService.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

export const generatePlan = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Use submitted profile overrides if provided, otherwise user's stored profile
  const payload = req.body.profile || user.profile || {};

  const planObj = generateWeeklyPlan(payload);

  const plan = new Plan({ user: user._id, days: planObj.days, meta: planObj.meta });
  await plan.save();

  res.json({ success: true, plan });
});

export const getMyPlans = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Authentication required', 401);

  const plans = await Plan.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

  res.json({ success: true, count: plans.length, plans });
});

export const getLatestPlan = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Authentication required', 401);

  const plan = await Plan.findOne({ user: userId }).sort({ createdAt: -1 });
  if (!plan) return res.json({ success: true, plan: null, message: 'No plan found' });

  res.json({ success: true, plan });
});

export default {
  generatePlan,
  getMyPlans,
  getLatestPlan,
};
