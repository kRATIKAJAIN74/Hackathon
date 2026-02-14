import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Generate JWT token
 */
export const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, config.jwtSecret, {
    expiresIn: config.jwtExpiry,
  });
};

/**
 * Verify JWT token middleware
 * Attaches decoded token to req.user
 */
export const verifyToken = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

/**
 * Optional token verifier: if token present, verify and attach req.user.
 * If no token, continue without error.
 */
export const optionalVerifyToken = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    // on any token error, ignore and continue (treat as unauthenticated)
    return next();
  }
};

/**
 * Extract token from Authorization header
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
};

/**
 * Middleware to ensure profile is completed
 * Use after verifyToken
 */
export const requireProfileCompletion = (req, res, next) => {
  // This will be populated by controllers after fetching user
  if (!req.userProfile) {
    return res.status(400).json({
      success: false,
      message: 'User profile not found',
    });
  }

  if (!req.userProfile.profileCompleted) {
    return res.status(403).json({
      success: false,
      message: 'Profile setup required. Please complete onboarding.',
      redirectTo: '/profile/setup',
    });
  }

  next();
};

export default {
  generateToken,
  verifyToken,
  requireProfileCompletion,
};
