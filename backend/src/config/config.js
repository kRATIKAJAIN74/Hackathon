import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/foodoscope',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  
  // Foodoscope API
  foodoscopeApiUrl: process.env.FOODOSCOPE_API_URL || 'https://www.foodoscope.com/api',
  foodoscopeApiKey: process.env.FOODOSCOPE_API_KEY || '',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Cache
  cacheDuration: parseInt(process.env.CACHE_DURATION || '3600', 10),

  // RecipeDB external API (cosylab.iiitd.edu.in)
  recipeBaseUrl: process.env.RECIPE_BASE_URL || '',
  recipeApiKey: process.env.RECIPE_API_KEY || '',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL || '300', 10),
};

export default config;
