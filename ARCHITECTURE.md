# Architecture & Implementation Details

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/Next.js)              │
│               (Auth UI, Profile Setup, Recipe Browse)      │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTP/REST Calls with JWT
              │
┌─────────────▼───────────────────────────────────────────────┐
│                    Express API Gateway                      │
│              (CORS, Error Handling, Logging)               │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────┼─────────┬────────────┐
    │         │         │            │
┌───▼──┐  ┌──▼───┐ ┌───▼────┐  ┌───▼────┐
│ Auth │  │Profile│ │Recipes │  │Nutrition
│Routes│  │Routes │ │Routes  │  │RulesEng
└───┬──┘  └──┬───┘ └───┬────┘  └───┬────┘
    │        │         │           │
    └────────┼─────────┼───────────┘
             │         │
        ┌────▼────┬────▼────┐
        │Controllers (Business Logic)
        └────┬────┴────┬────┐
             │         │    │
       ┌─────▼───┐ ┌──▼─────▼──┐  ┌─────────────┐
       │Services │ │Filtering  │  │Rule Engine  │
       │(API,    │ │& Ranking  │  │(Configurable│
       │Cache)   │ │           │  │ Constraints)│
       └─────┬───┘ └──┬────────┘  └─────────────┘
             │        │
        ┌────▼────────▼────┐
        │   Database       │
        │   (MongoDB)      │
        └─────────────────┘
             │
        ┌────▼──────────┐
        │ External APIs │
        │(Foodoscope)   │
        └───────────────┘
```

---

## Key Architectural Decisions

### 1. Rule-Based Nutrition Engine

**Why:** Goals + health conditions have different nutrition requirements that evolve.

**Implementation:**
- Centralized `NUTRITION_RULES` object (not hardcoded in controllers)
- Support for goal-override and condition-override strategies
- Easy to add new goals/conditions without touching business logic

**Example Path Through System:**
```
User registers with goal: "diabetes"
  ↓
Profile completed → computeNutritionConstraints()
  ↓
Checks NUTRITION_RULES.goals["diabetes"] → { sugarLimit: 5, ... }
  ↓
Checks NUTRITION_RULES.conditions (if any) → May override sugarLimit
  ↓
User constraints saved to database
  ↓
Recipe filtering uses these constraints
```

### 2. Backend Filtering & Ranking (NOT Frontend)

**Why:** Security & consistency. Never expose raw Foodoscope filters.

**Implementation:**
- Fetch recipes from Foodoscope (50+ candidates)
- Filter backend: allergies → diet type → constraints
- Rank by scoring: base score + bonuses - penalties
- Return top N to frontend

**Filtering Pipeline:**
```
Raw Recipes (50)
  ↓
Allergen Check (removes ~10)
  ↓
Diet Type Filter (removes ~5)
  ↓
Nutrition Constraints (soft filter, scores them)
  ↓
Ranking by Score (85+, 70+, 50+, <50)
  ↓
Top 10 Returned
```

### 3. Caching Strategy

**Why:** Foodoscope API has rate limits and costs.

**Implementation:**
- Cache recipes by search query + filters (1 hour TTL)
- Cache individual recipes (1 hour TTL)
- Cache invalidation on config change
- Graceful degradation if cache misses

**Cache Keys:**
```javascript
search:pasta:{"cuisineType":"italian"}
recipe:12345
trending:{"limit":20}
cuisine:italian:{"limit":50}
```

### 4. Service-Based Architecture

**Why:** Separation of concerns, testability, reusability.

**Services:**
- `nutritionRuleEngine.js` - Pure business logic, no I/O
- `foodoscopeService.js` - External API with caching
- `recipeFilteringService.js` - Filtering and ranking
- `authService.js` - Implicit in `authController.js`

**Benefits:**
- Services can be tested independently
- Services don't know about HTTP/Express
- Services can be reused in CLI, jobs, tests
- Easy to swap implementations (e.g., database for cache)

---

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  firstName: String,
  lastName: String,
  profileCompleted: Boolean,
  
  profile: {
    goal: String (enum),
    dietType: String (enum),
    allergies: [String],
    healthConditions: [String],
    nutritionConstraints: {
      calorieLimit: Number,
      sugarLimit: Number,
      sodiumLimit: Number,
      proteinTarget: Number
    }
  },
  
  preferences: {
    cuisines: [String],
    saveFavoriteRecipes: Boolean
  },
  
  favoriteRecipes: [String],  // Recipe IDs
  
  createdAt: Date,
  updatedAt: Date
}
```

### Recipe (In-Memory, from Foodoscope)
```javascript
{
  id: String,
  name: String,
  description: String,
  cuisineType: String,
  
  // Timing
  prepTime: Number (minutes),
  cookTime: Number (minutes),
  totalTime: Number,
  
  // Display
  difficulty: String (easy, medium, hard),
  imageUrl: String,
  servings: Number,
  
  // Content
  ingredients: [{
    name: String,
    amount: Number,
    unit: String
  }],
  instructions: [String],
  
  // Nutrition (per serving)
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
    cholesterol: Number
  },
  
  // Metadata
  tags: [String],
  allergens: [String],
  source: {
    api: String,
    url: String,
    originalId: String
  }
}
```

---

## Scoring Algorithm

### Calculation Steps

1. **Base Score:** 50 points

2. **Constraint Violations:**
   - Calories over limit: -0.3 per percentage point over
   - Sugar over limit: -0.5 per percentage point over (stricter)
   - Sodium over limit: -0.4 per percentage point over
   - Example: 50 calories over (125% of limit) = -0.3 × 25 = -7.5 points

3. **Optimal Range Bonuses:**
   - Protein 80-100% of target: +20 points
   - Calories 70-100% of limit: +15 points

4. **Additional Bonuses:**
   - Favorite recipe: +20 points
   - Preferred cuisine: +10 points
   - Easy difficulty: +5 points

5. **Final Score:** Max(0, base + violations + bonuses)

### Scoring Examples

**Example 1: Perfect Match**
```
Recipe: 520 cal, 18g protein, 8g sugar, 450mg sodium
User constraints: 1800 cal, 100g protein, 30g sugar, 2300mg sodium

Base: 50
Calories: 520/1800 = 29% → within optimal → +10
Protein: 18/100 = 18% → not in range → 0
Sugar: 8/30 = 27% → good → 0 (no penalty)
Sodium: 450/2300 = 20% → good → 0

Final Score: 50 + 10 = 60
```

**Example 2: High Sugar (Violates Constraint)**
```
Recipe: 500 cal, 15g protein, 45g sugar, 800mg sodium
User (Diabetic): 1800 cal, 75g protein, 5g sugar, 2000mg sodium

Base: 50
Sugar: 45/5 = 900% → 800% over → -0.5 × 800 = -400 points

Final Score: Max(0, 50 - 400) = 0
```

---

## Security Considerations

### 1. Authentication
- JWT tokens with expiration (default 7 days)
- Passwords hashed with bcrypt (10 salt rounds)
- Token stored in `Authorization: Bearer` header

### 2. Authorization
- All protected routes require valid JWT
- Profile completion enforced for recipe routes
- User can only access own data

### 3. Input Validation
- Email format checked
- Password minimum length enforced
- Enum values validated (goal, dietType, etc.)
- User input sanitized to prevent XSS

### 4. Error Handling
- Generic error messages (no database leaks)
- Stack traces hidden in production
- No sensitive data in response logs

---

## Performance Optimizations

### 1. Caching
```javascript
// Node-cache with 1-hour TTL
const results = cache.get(key);
if (!results) {
  results = await fetchFromAPI();
  cache.set(key, results);
}
```

### 2. Filtering Pipeline
- Single pass through recipes
- Early exit (allergens → diet → constraints)
- No unnecessary object creation

### 3. Database Queries
- Ready for indexing (not yet implemented)
  ```javascript
  db.users.createIndex({ email: 1 });
  ```
- Lean queries for read-only operations (future)

### 4. API Response
- Limit returned fields
- Lazy load user details in controllers
- Pagination ready (see utilities)

---

## Scalability Roadmap

### Phase 1 (Current - Hackathon)
- Single Node.js instance
- MongoDB (can be cloud)
- In-memory caching
- 100-1000 concurrent users

### Phase 2 (Production MVP)
- Load balancing (multiple Node instances)
- Redis caching (distributed)
- Database indexing
- Monitoring & logging
- Rate limiting
- 10K concurrent users

### Phase 3 (Scale Out)
- Microservices separation
  - Auth service
  - Profile service
  - Recipe service
  - Notification service
- GraphQL API layer
- Async job queue (BullMQ)
- Machine learning serving
- 100K concurrent users

### Phase 4 (Enterprise)
- Multi-region deployment
- Kubernetes orchestration
- Advanced analytics
- Custom ML models per user
- 1M+ concurrent users

---

## Testing Strategy

### Unit Tests
- `nutritionRuleEngine.test.js` - Scoring, constraints
- `recipeFilteringService.test.js` - Filter logic
- `helpers.test.js` - Utility functions

### Integration Tests
- Auth flow (register → login)
- Profile setup flow
- Recipe recommendation flow

### E2E Tests
- Full user journey via API

### Load Testing
- Apache JMeter scenarios
- K6 load tests
- Target: 100 requests/sec

---

## Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Update `JWT_SECRET` to strong value
- [ ] Update `CORS_ORIGIN` to frontend URL
- [ ] Verify Foodoscope API key
- [ ] MongoDB Atlas connection verified
- [ ] SSL/TLS certificate installed
- [ ] Rate limiting configured
- [ ] Logging aggregation setup
- [ ] Monitoring/alerting setup
- [ ] Database backups configured
- [ ] CDN setup for static files

---

## Known Limitations & TODOs

### Current Limitations
- Single server instance (not distributed)
- In-memory cache (lost on restart)
- Recipes cached at API moment (nutritional accuracy)
- Limited Foodoscope API integration (assume generic `search()` endpoint)

### TODOs
- [ ] PostgreSQL support
- [ ] Advanced caching strategies
- [ ] ML-based recipe personalization
- [ ] Social features (sharing, reviews)
- [ ] Mobile app native SDKs
- [ ] Webhook support for favorites sync
- [ ] Advanced filtering UI
- [ ] Admin dashboard
- [ ] A/B testing framework
- [ ] Analytics integration

---

## References

- **JWT:** https://jwt.io
- **bcrypt:** https://github.com/kelektiv/node.bcrypt.js
- **Express:** https://expressjs.com
- **MongoDB:** https://www.mongodb.com
- **Node-cache:** https://www.npmjs.com/package/node-cache

