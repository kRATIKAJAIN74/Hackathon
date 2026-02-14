# Backend Architecture & Service Design

## 🏗️ Layered Architecture

```
Express Server (Port 5000)
│
├─ Request Input
│  └─ CORS Middleware
│
├─ Middleware Layer
│  ├─ express.json() - Body parsing
│  ├─ CORS - Cross-origin requests
│  ├─ Error handling (catch all)
│  └─ Logging (optional)
│
├─ Routes Layer
│  ├─ /api/auth/* - Authentication endpoints
│  ├─ /api/profile/* - User profile endpoints
│  └─ /api/recipes/* - Recipe recommendation endpoints
│
├─ Controllers Layer
│  ├─ authController - Handle HTTP/JSON with validation
│  ├─ profileController - Handle HTTP/JSON with validation
│  └─ recipeController - Handle HTTP/JSON with validation
│
├─ Services Layer (CORE BUSINESS LOGIC)
│  ├─ nutritionRuleEngine - Rule computation & scoring
│  ├─ foodoscopeService - External API integration
│  ├─ recipeFilteringService - Filtering & ranking
│  └─ helpers - Utility functions
│
├─ Data Access Layer
│  ├─ User Model - MongoDB schema + methods
│  └─ mongoose abstracts DB queries
│
└─ Database (MongoDB)
   └─ Collections
      └─ users { _id, email, password, profile, favorites }
```

## 📁 File Structure

### Configuration Layer
```
config/
├─ config.js
│  ├─ Reads from environment
│  ├─ PORT: process.env.PORT || 5000
│  ├─ MONGODB_URI: process.env.MONGODB_URI
│  ├─ JWT_SECRET: process.env.JWT_SECRET
│  ├─ FOODOSCOPE_API_KEY: process.env.FOODOSCOPE_API_KEY
│  └─ Exports merged config object
│
└─ database.js
   ├─ Mongoose connection setup
   ├─ Error handling
   ├─ Connection events
   └─ Exported connectDB() function
```

### Models Layer
```
models/
└─ User.js (103 lines)
   ├─ Schema
   │  ├─ email - Required, unique, lowercase
   │  ├─ passwordHash - Hashed with bcryptjs (pre-save hook)
   │  └─ profile
   │     ├─ firstName, lastName
   │     ├─ goal (fitness, weight_loss, etc)
   │     ├─ dietType (omnivore, vegetarian, vegan)
   │     ├─ allergies (array of strings)
   │     ├─ healthConditions (array of strings)
   │     └─ nutritionConstraints (computed from rules)
   │  └─ favorites (array of recipe IDs)
   │  └─ createdAt, updatedAt (timestamps)
   │
   ├─ Methods
   │  └─ comparePassword(inputPassword) -> Boolean
   │
   ├─ Hooks
   │  ├─ pre('save') - Auto-hash password
   │  └─ post('save') - Remove password from response
   │
   └─ Middleware
      └─ toJSON() - Custom response transformation
```

### Middleware Layer
```
middleware/
├─ auth.js (61 lines)
│  ├─ generateToken(userId, expiresIn)
│  │  └─ Creates JWT with userId, signed with JWT_SECRET
│  │
│  ├─ verifyToken (middleware)
│  │  ├─ Extract token from Authorization header
│  │  ├─ Verify with JWT_SECRET
│  │  ├─ Attach payload to req.user
│  │  └─ 401 if invalid/missing
│  │
│  └─ requireProfileCompletion (middleware)
│     ├─ Check user.profileCompleted
│     ├─ If false: 403 with error message
│     └─ If true: Allow request through
│
└─ errorHandler.js (39 lines)
   ├─ Catches all errors in middleware stack
   ├─ Formats consistent error response
   │  └─ { success: false, error: message, status: code }
   ├─ Logs error to console
   └─ Returns appropriate HTTP status
```

### Services Layer (Core Business Logic)

#### 1. Nutrition Rule Engine (245 lines)
```
nutritionRuleEngine.js
│
├─ NUTRITION_RULES Object
│  ├─ goals
│  │  ├─ fitness: { calorieLimit, proteinTarget, sugarLimit, sodiumLimit }
│  │  ├─ weight_loss: { calorieLimit, proteinTarget, sugarLimit, sodiumLimit }
│  │  ├─ general_wellness: { ... }
│  │  ├─ diabetes: { ... }
│  │  └─ heart_health: { ... }
│  │
│  └─ conditions (overrides for specific health conditions)
│     ├─ hypertension: { sodiumLimit override }
│     ├─ diabetes: { sugarLimit override }
│     ├─ obesity: { calorieLimit override }
│     ├─ kidney_disease: { sodiumLimit, proteinTarget override }
│     └─ high_cholesterol: { sodiumLimit override }
│
├─ computeNutritionConstraints(profile)
│  ├─ Input: { goal, dietType, allergies, healthConditions }
│  ├─ Step 1: Get constraints for user's goal
│  ├─ Step 2: Apply condition overrides
│  ├─ Step 3: Return final constraint object
│  └─ Output: { calorieLimit, proteinTarget, sugarLimit, sodiumLimit }
│
├─ calculateRecipeScore(recipe, constraints, profile)
│  ├─ Base scoring (0-100)
│  │  ├─ Calorie alignment score
│  │  ├─ Protein target score
│  │  ├─ Sugar/Sodium violation penalty
│  │  └─ Initial score = average of above
│  │
│  ├─ Bonus scoring
│  │  ├─ +15 if in favorites
│  │  ├─ +10 if cuisine preference matches
│  │  └─ +5 if matches diet type
│  │
│  └─ Final score (0-130 possible)
│
├─ validateRecipeConstraints(recipe, constraints)
│  ├─ Checks: calories, protein, sugar, sodium
│  ├─ Returns: { valid: Boolean, violations: [] }
│  └─ Used for filtering
│
└─ getNutritionRules()
   └─ Returns NUTRITION_RULES object (admin endpoint)
```

#### 2. Foodoscope Service (178 lines)
```
foodoscopeService.js
│
├─ Cache Setup
│  ├─ Node-Cache instance with 1 hour TTL
│  └─ Key pattern: "${endpoint}:${JSON.stringify(params)}"
│
├─ normalizeRecipe(apiRecipe)
│  ├─ Input: Raw Foodoscope API response
│  ├─ Standardizes field names
│  ├─ Provides safe defaults for missing nutrition
│  └─ Output: Normalized recipe object
│
├─ searchRecipes(searchTerm, limit = 20)
│  ├─ Check cache first
│  ├─ If miss: Call Foodoscope API
│  ├─ Normalize response
│  ├─ Store in cache
│  ├─ Return recipes array
│  └─ On error: Log and return []
│
├─ getRecipeById(recipeId)
│  ├─ Check cache
│  ├─ API call if miss
│  ├─ Single recipe normalization
│  └─ Cache store
│
├─ getTrendingRecipes(limit = 10)
│  ├─ Call Foodoscope trending endpoint
│  ├─ Cache for 1 hour
│  └─ Normalize all recipes
│
├─ getRecipesByCuisine(cuisine, limit = 20)
│  ├─ Cache-aside pattern
│  ├─ Filter by cuisine type
│  └─ Return paginated results
│
└─ Error Handling
   ├─ Network errors → []
   ├─ 429 (rate limit) → []
   ├─ 401 (auth) → throw error
   └─ All logged with context

Architecture Decision: Cache-Aside Pattern
- Query cache first
- On miss, load from API
- Store in cache
- Benefits: Reduced API calls, faster responses, graceful degradation
- TTL: 1 hour (balance freshness vs performance)
```

#### 3. Recipe Filtering & Ranking Service (216 lines)
```
recipeFilteringService.js
│
├─ filterRecipesForUser(recipes, profile, constraints)
│  ├─ Input: Raw recipes from Foodoscope
│  ├─ Filter 1: Remove allergen conflicts
│  │  └─ Check recipe.allergens against profile.allergies
│  ├─ Filter 2: Validate diet type matching
│  │  └─ recipe.dietType must contain or be compatible with user's
│  ├─ Filter 3: Nutrition constraint validation
│  │  └─ validateRecipeConstraints() from rule engine
│  └─ Output: Filtered recipes array
│
├─ rankRecipes(recipes, profile, constraints, favorites)
│  ├─ Score all recipes using rule engine
│  ├─ Sort by score descending
│  ├─ Attach metadata
│  │  ├─ score: calculated 0-130
│  │  ├─ isFavorite: boolean
│  │  ├─ violations: constraint violations if any
│  │  └─ scoreBreakdown: { calorie, protein, allergy, bonus }
│  └─ Output: Ranked recipes with metadata
│
├─ getTopRecommendations(recipes, profile, constraints, favorites, limit = 10)
│  ├─ Filter + Rank
│  ├─ Return top N
│  └─ All constraints satisfied
│
├─ getDiverseRecommendations(recipes, profile, constraints, favorites, limit = 10)
│  ├─ Filter + Rank (same as top)
│  ├─ Diversify by cuisine
│  │  └─ Ensure different cuisines in result
│  ├─ Include variety of difficulty levels
│  └─ Return N recipes with diversity
│
└─ Helper Functions
   ├─ calculateAllergenyScore(recipe, allergies)
   ├─ calculateDietTypeCompatibility(recipe, diet)
   └─ getMostCommonCuisine(recipes)

Scoring Algorithm Example:
Recipe: { calories: 450, protein: 35g, sugar: 8g, sodium: 600mg }
User Constraints: { calorieLimit: 2000, proteinTarget: 150, sugarLimit: 25, sodiumLimit: 2000 }

Base Scores:
- Calorie alignment: 450 / 2000 = 0.225 / optimal = 90 points
- Protein alignment: 35 / 150 = 0.233 / optimal = 88 points
- Sugar compliance: 8 < 25 ✓ = 100 points
- Sodium compliance: 600 < 2000 ✓ = 100 points

Base Score = (90 + 88 + 100 + 100) / 4 = 94.5

Bonuses:
- Favorite: +15
- Cuisine match: +10
- Diet type match: +5

Final Score = 94.5 + 15 + 10 + 5 = 124.5 / 130
```

### Controllers Layer

#### Auth Controller (88 lines)
```
authController.js
│
├─ register(email, password, firstName, lastName)
│  ├─ Validation
│  │  ├─ Email format check
│  │  ├─ Password strength (min 8 chars, uppercase, number)
│  │  └─ Required fields check
│  ├─ Duplicate check: findOne({ email })
│  ├─ Hash password using bcryptjs
│  ├─ Save user to MongoDB
│  ├─ Generate JWT token
│  └─ Return { success: true, user, token }
│
├─ login(email, password)
│  ├─ Find user by email
│  ├─ Compare input password with hashed
│  ├─ If match:
│  │  ├─ Generate token
│  │  ├─ Return { user, token }
│  │  └─ Also return redirectTo: profileCompleted ? '/recipes' : '/profile/setup'
│  └─ If no match: 401 Unauthorized
│
└─ getCurrentUser() [Protected Route]
   ├─ Extract userId from req.user (set by auth middleware)
   ├─ Fetch user from DB
   └─ Return { user }

SECURITY:
- Passwords never stored in plain text
- Passwords compared with bcrypt.compare()
- Tokens signed with JWT_SECRET
- Tokens expire after 7 days
```

#### Profile Controller (161 lines)
```
profileController.js
│
├─ setupProfile(userId, goal, dietType, allergies, healthConditions) [Protected]
│  ├─ Validation of all fields
│  ├─ Call nutritionRuleEngine.computeNutritionConstraints()
│  ├─ Store computed constraints in user.profile
│  ├─ Set profileCompleted = true
│  ├─ Save to DB
│  └─ Return { success: true, user }
│
├─ updateProfile(userId, updates) [Protected + ProfileComplete]
│  ├─ Validate input fields
│  ├─ If goal or conditions changed:
│  │  ├─ Recompute nutritionConstraints
│  │  └─ Store new constraints
│  ├─ Save changes
│  └─ Return { user }
│
├─ getProfile(userId) [Protected]
│  └─ Fetch user with all profile data
│
├─ addFavorite(userId, recipeId) [Protected]
│  ├─ Check if already favorited
│  ├─ If not: push recipeId to favorites array
│  ├─ Save
│  └─ Return { favorites: updatedArray }
│
├─ removeFavorite(userId, recipeId) [Protected]
│  ├─ Remove recipeId from favorites array
│  ├─ Save
│  └─ Return { favorites: updatedArray }
│
└─ getFavorites(userId) [Protected]
   └─ Return user.favorites (array of recipe IDs)

CONSTRAINTS EXAMPLE:
user.profile = {
  goal: 'weight_loss',
  dietType: 'vegetarian',
  healthConditions: ['diabetes'],
  nutritionConstraints: {
    calorieLimit: 1800,      // from weight_loss
    proteinTarget: 150,      // from goal
    sugarLimit: 5,           // OVERRIDE: diabetes condition
    sodiumLimit: 2300,       // from goal
  }
}
```

#### Recipe Controller (156 lines)
```
recipeController.js
│
├─ getRecommendations(userId, limit = 10, diverse = false) [Protected + ProfileComplete]
│  ├─ Fetch user profile with constraints
│  ├─ Call foodoscopeService.getTrendingRecipes()
│  ├─ Call recipeFilteringService.filter()
│  ├─ If diverse: getDiverseRecommendations()
│  ├─ Else: getTopRecommendations()
│  └─ Return { recipes: ranked and filtered }
│
├─ searchRecipes(userId, query, filters = {}, limit = 20) [Protected + ProfileComplete]
│  ├─ Input: { query, cuisine?, difficulty?, maxCalories? }
│  ├─ Fetch user profile with constraints
│  ├─ Call foodoscopeService.searchRecipes(query)
│  ├─ Apply custom filters from request
│  ├─ Call recipeFilteringService.filter()
│  ├─ Rank and sort
│  └─ Return { recipes }
│
├─ getRecipesByCuisine(userId, cuisine, limit = 20) [Protected + ProfileComplete]
│  ├─ Fetch user profile + constraints
│  ├─ Call foodoscopeService.getRecipesByCuisine(cuisine)
│  ├─ Filter + rank
│  └─ Return { recipes }
│
├─ getRecipeDetail(userId, recipeId) [Protected + ProfileComplete]
│  ├─ Fetch recipe by ID from API
│  ├─ Score/profile fit
│  ├─ Check if in user.favorites
│  └─ Return { recipe, score, isFavorite, constraints }
│
└─ Error Handling
   ├─ 400: Invalid input
   ├─ 401: Unauthorized
   ├─ 403: Profile not complete
   └─ 500: Server error
```

### Routes Layer (3 files, 80 lines total)

```
routes/
├─ authRoutes.js
│  ├─ POST /api/auth/register
│  │  └─ {"email": "user@example.com", "password": "...", "firstName": "John", "lastName": "Doe"}
│  ├─ POST /api/auth/login
│  │  └─ {"email": "user@example.com", "password": "..."}
│  └─ GET /api/auth/me [Protected]
│     └─ Returns current authenticated user
│
├─ profileRoutes.js
│  ├─ POST /api/profile/setup [Protected]
│  │  └─ {"goal": "...", "dietType": "...", "allergies": [...], "healthConditions": [...]}
│  ├─ PUT /api/profile [Protected]
│  │  └─ Update any profile fields
│  ├─ GET /api/profile [Protected]
│  │  └─ Get user profile with all data
│  ├─ POST /api/profile/favorites [Protected]
│  │  └─ {"recipeId": "..."}
│  ├─ DELETE /api/profile/favorites/:recipeId [Protected]
│  │  └─ Remove from favorites
│  └─ GET /api/profile/favorites [Protected]
│     └─ Get all favorited recipe IDs
│
└─ recipeRoutes.js
   ├─ GET /api/recipes/recommendations [Protected, ProfileComplete]
   │  └─ ?limit=10&diverse=false
   ├─ GET /api/recipes/search [Protected, ProfileComplete]
   │  └─ ?query=pasta&cuisine=italian&maxCalories=500
   ├─ GET /api/recipes/cuisine/:cuisine [Protected, ProfileComplete]
   │  └─ Returns recipes filtered by cuisine
   └─ GET /api/recipes/:id [Protected, ProfileComplete]
      └─ Get detailed recipe with scoring
```

## 🔄 Request Flow Example

### Complete User Journey: Login → Search Recipe

```
1. USER ACTION: Submit login form
   Frontend LoginPage.jsx
   ├─ GET /api/auth/login
   └─ POST body: { email, password }

2. BACKEND: Express Routes
   routes/authRoutes.js → authController.login()
   ├─ Query DB: User.findOne({ email })
   ├─ Compare password with bcryptjs
   ├─ Call: generateToken(userId)
   │  └─ Returns: JWT token signed with JWT_SECRET
   └─ Return: { user, token }

3. FRONTEND: AuthContext.jsx
   ├─ Store token in localStorage
   ├─ Set user state
   ├─ Navigate to /recipes (or /profile/setup if first time)

4. USER ACTION: Fill profile form
   Frontend ProfileSetupPage.jsx
   ├─ POST /api/profile/setup
   └─ Body: { goal: 'weight_loss', dietType: 'vegetarian', allergies: [], healthConditions: ['diabetes'] }

5. BACKEND: Express Routes
   profileController.setupProfile()
   ├─ Call nutritionRuleEngine.computeNutritionConstraints()
   │  └─ map goal 'weight_loss' + condition 'diabetes' → { calorieLimit: 1800, sugarLimit: 5, ... }
   ├─ Store in User.profile.nutritionConstraints
   ├─ Set profileCompleted = true
   └─ Return: { user: { profile: {..., nutritionConstraints: {...} } } }

6. USER ACTION: Search for recipes
   Frontend SearchPage.jsx
   ├─ Input: query = "pasta", cuisine = "italian"
   ├─ GET /api/recipes/search?query=pasta&cuisine=italian
   │  (Interceptor auto-adds Authorization: Bearer {token})

7. BACKEND: Express Routes
   recipeController.searchRecipes()
   ├─ Verify token is valid → Extract userId
   ├─ Fetch user with constraints from DB
   │  └─ user.profile.nutritionConstraints = { calorieLimit: 1800, sugarLimit: 5, ... }
   ├─ Call foodoscopeService.searchRecipes("pasta")
   │  ├─ Check cache for "search:pasta"
   │  ├─ If miss: Call external API
   │  ├─ Normalize recipes
   │  └─ Store in cache (1 hour TTL)
   ├─ Call recipeFilteringService.filterRecipesForUser()
   │  ├─ Remove allergens (user.profile.allergies)
   │  ├─ Validate diet type (user.profile.dietType)
   │  ├─ Validate nutrition constraints (sugar < 5g for diabetes)
   │  └─ Return filtered recipes
   ├─ Call recipeFilteringService.rankRecipes()
   │  ├─ For each recipe:
   │  │  ├─ Call nutritionRuleEngine.calculateRecipeScore()
   │  │  │  ├─ Calorie alignment: recipe.calories vs calorieLimit
   │  │  │  ├─ Protein alignment: recipe.protein vs target
   │  │  │  ├─ Sugar check: recipe.sugar < 5 ? +100 : -50
   │  │  │  └─ Score = 0-130
   │  │  └─ Check if in user.favorites (+15 bonus)
   │  ├─ Sort by score descending
   │  └─ Return ranked recipes
   └─ Return: { recipes: [ {name, score, isFavorite, ...}, ... ] }

8. FRONTEND: RecipeContext.jsx
   ├─ setRecipes(response.data.recipes)
   ├─ Trigger re-render of RecipesPage component

9. UI RENDER: RecipesPage
   ├─ RecipeGrid
   │  └─ recipes.map(recipe => <RecipeCard recipe={recipe} />)
   │     └─ Display: image, name, nutrition, score badge

10. USER ACTION: Save favorite
    RecipeCard.jsx
    ├─ Click heart button
    ├─ POST /api/profile/favorites
    └─ Body: { recipeId: "xyz123" }

11. BACKEND: Express Routes
    profileController.addFavorite()
    ├─ Push recipeId to user.favorites array
    ├─ Save to DB
    └─ Return: { favorites: [...] }

12. FRONTEND: RecipeContext.jsx
    ├─ Update favorites state
    ├─ Trigger re-score of recipes (favorites get +15 bonus)
    ├─ RecipeCard shows filled heart icon
```

## 🛡️ Security Architecture

```
Layer 1: Middleware
├─ CORS: Restrict origins
├─ Body Parser: Limit request size
└─ Rate Limiting: (Future enhancement)

Layer 2: Authentication
├─ Password: bcryptjs hashing (10 salt rounds)
├─ JWT: Token signing with HS256
├─ Token Expiry: 7 days
└─ Token Storage: localStorage (frontend), not exposed in server logs

Layer 3: Authorization
├─ verifyToken: Checks valid JWT
├─ requireProfileCompletion: Ensures setup flow
└─ User ID check: Controllers compare req.user.id with requested user

Layer 4: Validation
├─ Input validation: express-validator or manual checks
├─ Field type checking: Mongoose schema
└─ Range validation: Nutrition values within realistic bounds

Layer 5: Data Privacy
├─ Password removed from responses: toJSON() hook
├─ Favorites stored at user level: No public exposure
└─ Health conditions: Private user data
```

## 📊 Data Model

### User Document in MongoDB
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  passwordHash: "$2b$10$...", // bcrypt hash
  profile: {
    firstName: "John",
    lastName: "Doe",
    goal: "weight_loss", // enum: fitness, weight_loss, general_wellness, diabetes, heart_health
    dietType: "vegetarian", // enum: omnivore, vegetarian, vegan
    allergies: ["peanuts", "shellfish"], // array of strings
    healthConditions: ["diabetes"], // array of strings
    nutritionConstraints: {
      calorieLimit: 1800,
      proteinTarget: 150,
      sugarLimit: 5,
      sodiumLimit: 2300,
    },
  },
  profileCompleted: true,
  favorites: ["recipe_id_1", "recipe_id_2", "recipe_id_3"],
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
}
```

## 🚀 Performance Optimization

### Caching Strategy
```
Foodoscope API Calls
│
├─ searchRecipes("pasta")
│  ├─ Cache key: "search:pasta"
│  ├─ TTL: 1 hour
│  └─ Reduces API calls from every search to once per hour
│
├─ getTrendingRecipes()
│  ├─ Cache key: "trending"
│  ├─ TTL: 1 hour
│  └─ Reused for all users
│
└─ Estimated Performance
   ├─ First search: ~2000ms (API call)
   ├─ Cached search: ~50ms (memory read)
   └─ Improvement: 40x faster
```

### Database Optimization (Future)
```
Indexes:
├─ email (unique, already set)
├─ profileCompleted (for filtering on-boarded users)
└─ favorites (for quick favorite lookups)

Query Optimization:
├─ Use lean() for read-only queries
├─ Project only needed fields
└─ Batch similar queries
```

## 📈 Scalability Considerations

### Horizontal Scaling
```
Load Balancer
│
├─ Server Instance 1 (Node process)
├─ Server Instance 2 (Node process)
├─ Server Instance 3 (Node process)
│
└─ Shared Resources
   ├─ MongoDB Atlas (managed, auto-scaling)
   ├─ Redis Cache (shared, for distributed caching)
   └─ Foodoscope API (external)

Implementation:
- Use environment variables for instance configuration
- Use connection pooling for database
- Use centralized cache (Redis) instead of node-cache
```

### Database Scaling
```
Current: MongoDB single collection (users)
│
Future: Sharding by userId
├─ Shard 1: Users A-G
├─ Shard 2: Users H-O
└─ Shard 3: Users P-Z

Benefits:
- Distribute load across multiple database instances
- Improved query performance for large datasets
- Handle millions of users
```

### API Optimization
```
Current Implementation:
- Foodoscope API queries per request
- Cache-aside pattern (1 hour TTL)

Future Enhancements:
- Query batching (combine multiple searches)
- Predictive caching (anticipate user searches)
- CDN for recipe images
- API rate limiting per user (prevent abuse)
```

## 🧪 Testing Strategy (Not Yet Implemented)

```
Unit Tests:
├─ nutritionRuleEngine.test.js
│  ├─ computeNutritionConstraints() with various profiles
│  ├─ calculateRecipeScore() with edge cases
│  └─ validateRecipeConstraints() with violations
├─ foodoscopeService.test.js
│  ├─ Cache hits and misses
│  ├─ API error handling
│  └─ Recipe normalization
└─ recipeFilteringService.test.js
   ├─ Allergen filtering
   ├─ Constraint validation
   └─ Score calculation

Integration Tests:
├─ authController.test.js
│  ├─ Register new user
│  ├─ Login with valid credentials
│  └─ Login with invalid credentials
├─ profileController.test.js
│  ├─ Profile setup flow
│  ├─ Update profile with constraint recalculation
│  └─ Favorite management
└─ recipeController.test.js
   ├─ Get recommendations for user
   ├─ Search recipes with filters
   └─ Recipe detail with scoring

E2E Tests (Postman):
├─ Complete user journey: register → setup profile → search → favorite
├─ Profile update and constraint recalculation
└─ Error scenarios: invalid input, missing auth, profile incomplete

Test Coverage:
├─ Target: 70%+ line coverage
├─ Focus: Core business logic (rule engine, filtering)
└─ Validation: All error paths covered
```

---

**Backend Architecture Document v1.0**
*Built with Node.js, Express, MongoDB*
