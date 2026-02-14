import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

/**
 * Register a new user
 */
export const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  console.log(req.body);

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    throw new AppError('User already exists with this email', 400);
  }

  user = new User({
    email: email.toLowerCase(),
    password,
    firstName: firstName || '',
    lastName: lastName || '',
  });

  await user.save();

  const token = generateToken(user._id, user.email);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please complete your profile.',
    token,
    user: user.toJSON(),
    redirectTo: '/profile/setup',
  });
});

/**
 * Login user
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user._id, user.email);

  const redirectTo = user.profileCompleted ? '/recipes/recommendations' : '/profile/setup';

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toJSON(),
    redirectTo,
  });
});

/**
 * Get current user profile
 */
export const getCurrentUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    user: user.toJSON(),
  });
});

export default {
  register,
  login,
  getCurrentUser,
};
