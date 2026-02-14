import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import config from './src/config/config.js';
import recipeDb from './src/services/recipeDbService.js';

const PORT = config.port;

/**
 * Start server
 */
const startServer = async () => {
  try {
    await connectDatabase();

    if (recipeDb.logRecipeConfig) {
      recipeDb.logRecipeConfig();
    } else {
      const url = config.recipeBaseUrl || process.env.RECIPE_BASE_URL || '(none)';
      const hasKey = Boolean(config.recipeApiKey || process.env.RECIPE_API_KEY);
      console.log(JSON.stringify({ message: 'Recipe API config', baseUrl: url, hasApiKey: hasKey }));
    }

    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ Database: MongoDB`);
      console.log(`${'='.repeat(50)}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
