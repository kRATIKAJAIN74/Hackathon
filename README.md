# Foodoscope Recipe Recommendations API

A scalable, production-ready backend for personalized food and recipe recommendations using Foodoscope APIs.

## 🏗️ Architecture Overview

```
├── Authentication & JWT-based security
├── User Profile & Onboarding system
├── Nutrition Rule Engine (configurable, not hardcoded)
├── Recipe Fetching & Normalization
├── Intelligent Filtering & Ranking
├── Caching & Performance optimization
└── RESTful API design
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd Hackathon
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Start MongoDB:**
```bash
# Local MongoDB (if installed)
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

4. **Start the server:**
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── config/
│   ├── config.js              # Environment configuration
│   └── database.js            # MongoDB connection
├── models/
│   └── User.js                # User schema with auth & profile
├── middleware/
│   ├── auth.js                # JWT verification middleware
│   └── errorHandler.js        # Centralized error handling
├── services/
│   ├── nutritionRuleEngine.js # Core rule engine (configurable)
│   ├── foodoscopeService.js   # Foodoscope API client with caching
│   └── recipeFilteringService.js # Filtering & ranking logic
├── controllers/
│   ├── authController.js      # Auth endpoints
│   ├── profileController.js   # Profile & onboarding
│   └── recipeController.js    # Recipe recommendations
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── profileRoutes.js       # /api/profile
│   └── recipeRoutes.js        # /api/recipes
└── app.js                     # Express app setup

server.js                       # Entry point
.env.example                    # Environment template
package.json                    # Dependencies
```

## 🔑 Key Components

### 1. **Nutrition Rule Engine** (`nutritionRuleEngine.js`)
Configurable, extensible rule engine that maps:
- **Goals** → nutrition constraints
- **Health conditions** → constraint overrides
- **Recipes** → violation detection & scoring

```javascript
// Example: Diabetes goal automatically sets sugarLimit = 5mg
const constraints = computeNutritionConstraints(profile);
```

**Extensibility:** Add new rules to `NUTRITION_RULES` without touching controllers.

### 2. **Foodoscope API Service** (`foodoscopeService.js`)
- **Caching layer** to avoid redundant API calls
- **Normalization** of nutrition data (handles missing fields)
- **Error handling** with graceful degradation
- **Configurable TTL** via environment

```javascript
// Cached search with automatic normalization
const recipes = await searchRecipes('healthy pasta', filters);
```

### 3. **Recipe Filtering & Ranking** (`recipeFilteringService.js`)
Backend-only filtering logic:
- Allergen checking (hard constraint)
- Diet type validation
- Nutrition constraint enforcement
- Score-based ranking with bonuses

```javascript
// Complex ranking with multiple factors
const ranked = rankRecipes(recipes, userProfile);
// Returns recipes sorted by personalization score
```

## 📚 API Endpoints

### Authentication
```http
POST   /api/auth/register        # Create new user
POST   /api/auth/login           # Login & get JWT token
GET    /api/auth/me              # Get current user (requires JWT)
```

### User Profile
```http
POST   /api/profile/setup        # Complete onboarding (after first login)
GET    /api/profile              # Get user profile
PUT    /api/profile/update       # Update profile
POST   /api/profile/favorites/add
DELETE /api/profile/favorites/remove
GET    /api/profile/favorites
```

### Recipes
```http
GET    /api/recipes/recommendations       # Personalized recommendations
GET    /api/recipes/search?q=pasta        # Search with backend filtering
GET    /api/recipes/cuisine/:type         # Recipes by cuisine
GET    /api/recipes/id/:id                # Recipe details
GET    /api/recipes/rules/nutrition       # View nutrition rules (debug)
```

## 🔐 Authentication Flow

1. **Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'
```

2. **Response includes JWT token:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "redirectTo": "/profile/setup"
}
```

3. **Complete onboarding:**
```bash
curl -X POST http://localhost:5000/api/profile/setup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "weight_loss",
    "dietType": "vegetarian",
    "allergies": ["peanuts", "shellfish"],
    "healthConditions": [])
}'
```

## 🧠 Nutrition Rule Engine Deep Dive

### How It Works

1. **Goal-based constraints** (base layer):
```javascript
fitness: { calorieLimit: 2200, proteinTarget: 150, ... }
diabetes: { calorieLimit: 1800, sugarLimit: 5, ... }
```

2. **Health condition overrides** (enhancement layer):
```javascript
hypertension: { sodiumLimit: 1500 }  // Overrides goal's sodium
kidney_disease: { proteinTarget: 0.5 * normal }  // Reduces protein
```

3. **Recipe scoring** (personalization):
- Base score: 50
- Subtract penalties for constraint violations
- Add bonuses for perfect macro alignment
- Bonus for favorite recipes & cuisine preferences
- Range: 0-100+

### Adding New Rules

Edit `nutritionRuleEngine.js` and add to `NUTRITION_RULES`:

```javascript
goals: {
  // Add new goal
  muscle_gain: {
    calorieLimit: 2500,
    proteinTarget: 200,
    sugarLimit: 60,
    sodiumLimit: 2300,
  },
},

conditions: {
  // Add new health condition
  gout: {
    sodiumLimit: 1500,
    purineLimitWillBeAddedInV2: /* future */,
  },
},
```

No controller changes needed!

## 🚀 Performance & Scalability

### Caching Strategy
- **Foodoscope API responses** cached for 1 hour (configurable)
- **User profiles** cached in memory during session
- **Nutrition rules** loaded once at startup

### Optimization Features
- Efficient MongoDB queries with indexing ready
- Batch filtering in single pass
- Score calculation optimized for ranking
- Graceful API degradation if Foodoscope fails

### Future Enhancements
```javascript
// TODO: Database indexing
db.users.createIndex({ email: 1 });
db.recipes.createIndex({ userId: 1, createdAt: -1 });

// TODO: Redis caching for distributed systems
// TODO: Async job queue for recipe fetching
// TODO: GraphQL API layer
```

## ⚙️ Configuration

All settings via `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/foodoscope

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Foodoscope API
FOODOSCOPE_API_URL=https://www.foodoscope.com/api
FOODOSCOPE_API_KEY=your_api_key

# Frontend CORS
CORS_ORIGIN=http://localhost:3000

# Cache
CACHE_DURATION=3600
```

## 🧪 Example Workflows

### Workflow 1: User Registration & Onboarding
```
1. POST /auth/register → JWT token
2. Redirect to profile setup
3. POST /profile/setup → constraints calculated
4. GET /recipes/recommendations → personalized list
```

### Workflow 2: Heart Health User
```
Goal: heart_health
Health conditions: [hypertension]
Result: sugarLimit=40, sodiumLimit=1500 (overridden)
```

### Workflow 3: Vegan Diabetic
```
Constraints: sugarLimit=5, no animal products
Search: healthy vegan recipes
Filter: Remove non-vegan, high-sugar
Rank: By vegan-friendly + low-sugar
```

## 🛠️ Development

### Running Tests (future)
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Reset (dev only)
```javascript
// In MongoDB shell
use foodoscope
db.users.deleteMany({})
```

## 📋 Best Practices Implemented

✅ **Modular architecture** - Services, controllers, models separated  
✅ **No hardcoded logic** - Rules in `NUTRITION_RULES` object  
✅ **Error handling** - Centralized middleware  
✅ **Security** - JWT auth, password hashing with bcrypt  
✅ **Caching** - Avoid redundant API calls  
✅ **Validation** - Input checked before processing  
✅ **Logging** - Request logging via middleware  
✅ **Environment config** - All secrets in .env  
✅ **Graceful degradation** - API unavailability handled  
✅ **Documentation** - Inline comments, this README  

## 🚨 Troubleshooting

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- May need to create MongoDB Atlas account

**"Invalid Foodoscope API key"**
- Update `FOODOSCOPE_API_KEY` in `.env`
- Get key from https://www.foodoscope.com/api

**"CORS errors"**
- Update `CORS_ORIGIN` to match frontend URL
- Ensure frontend sends correct headers

## 📝 License

MIT

## 🤝 Contributing

This is a hackathon project. Key areas for extension:
- PostgreSQL support
- GraphQL API
- Real-time notifications
- Advanced filtering UI
- Mobile app
- Machine learning for personalization

---

**Built with ❤️ for better nutrition 🥗**
