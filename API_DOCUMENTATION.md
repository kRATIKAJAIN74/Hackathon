# API Documentation

## Base URL
```
http://localhost:5000/api
```

All secure endpoints require JWT token in `Authorization: Bearer <token>` header.

---

## Authentication Endpoints

### 1. Register New User
**POST** `/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please complete your profile.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "657a1b2c3d4e5f6g7h8i9j0k",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileCompleted": false,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "redirectTo": "/profile/setup"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

### 2. Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "657a1b2c3d4e5f6g7h8i9j0k",
    "email": "user@example.com",
    "profileCompleted": true
  },
  "redirectTo": "/recipes/recommendations"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "657a1b2c3d4e5f6g7h8i9j0k",
    "email": "user@example.com",
    "profileCompleted": true,
    "profile": {
      "goal": "weight_loss",
      "dietType": "vegetarian",
      "allergies": ["peanuts"],
      "nutritionConstraints": {
        "calorieLimit": 1800,
        "sugarLimit": 30,
        "sodiumLimit": 2000,
        "proteinTarget": 100
      }
    }
  }
}
```

---

## Profile Endpoints

### 1. Complete Profile Setup (Onboarding)
**POST** `/profile/setup`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "goal": "weight_loss",
  "dietType": "vegetarian",
  "allergies": ["peanuts", "shellfish"],
  "healthConditions": ["hypertension"]
}
```

**Valid Goals:**
- `fitness` - Muscle building & fitness optimization
- `weight_loss` - Low calorie, sustainable loss
- `general_wellness` - Balanced nutrition
- `diabetes` - Very low sugar
- `heart_health` - Low sodium, heart-healthy

**Valid Diet Types:**
- `vegetarian` - No meat, includes dairy
- `non_vegetarian` - All foods allowed
- `vegan` - No animal products

**Valid Health Conditions:**
- `hypertension` - High blood pressure
- `diabetes` - Diabetes management
- `obesity` - Weight management
- `high_cholesterol` - Cholesterol control
- `kidney_disease` - Kidney health

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile setup completed successfully",
  "user": {
    "_id": "657a1b2c3d4e5f6g7h8i9j0k",
    "profileCompleted": true,
    "profile": {
      "goal": "weight_loss",
      "dietType": "vegetarian",
      "allergies": ["peanuts", "shellfish"],
      "healthConditions": ["hypertension"],
      "nutritionConstraints": {
        "calorieLimit": 1800,
        "sugarLimit": 30,
        "sodiumLimit": 1500,
        "proteinTarget": 100
      }
    }
  },
  "nutritionConstraints": {
    "calorieLimit": 1800,
    "sugarLimit": 30,
    "sodiumLimit": 1500,
    "proteinTarget": 100
  },
  "redirectTo": "/recipes/recommendations"
}
```

---

### 2. Update Profile
**PUT** `/profile/update`

**Request:**
```json
{
  "goal": "fitness",
  "allergies": ["peanuts"],
  "cuisines": ["italian", "mediterranean"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... },
  "nutritionConstraints": { ... }
}
```

---

### 3. Get Current Profile
**GET** `/profile`

**Response (200 OK):**
```json
{
  "success": true,
  "user": { /* Full user object */ }
}
```

---

### 4. Add Recipe to Favorites
**POST** `/profile/favorites/add`

**Request:**
```json
{
  "recipeId": "foodoscope_recipe_12345"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Recipe added to favorites",
  "favoriteCount": 5
}
```

---

### 5. Remove Recipe from Favorites
**DELETE** `/profile/favorites/remove`

**Request:**
```json
{
  "recipeId": "foodoscope_recipe_12345"
}
```

---

### 6. Get Favorite Recipes
**GET** `/profile/favorites`

**Response (200 OK):**
```json
{
  "success": true,
  "favorites": ["recipe_id_1", "recipe_id_2"],
  "count": 2
}
```

---

## Recipe Endpoints

### 1. Get Personalized Recommendations
**GET** `/recipes/recommendations?limit=10&diverse=false`

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)
- `diverse` (optional): Return diverse cuisines (default: false)

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "recommendations": [
    {
      "id": "recipe_12345",
      "name": "Vegetarian Buddha Bowl",
      "description": "Nutritious bowl with quinoa, roasted veggies",
      "cuisineType": "Mediterranean",
      "servings": 2,
      "prepTime": 15,
      "cookTime": 20,
      "totalTime": 35,
      "difficulty": "easy",
      "imageUrl": "https://...",
      "ingredients": [
        { "name": "quinoa", "amount": 1, "unit": "cup" },
        { "name": "broccoli", "amount": 2, "unit": "cups" }
      ],
      "instructions": [
        "Cook quinoa...",
        "Roast vegetables..."
      ],
      "nutrition": {
        "calories": 520,
        "protein": 18,
        "carbs": 72,
        "fat": 12,
        "fiber": 8,
        "sugar": 8,
        "sodium": 450
      },
      "tags": ["vegetarian", "gluten-free", "vegan"],
      "allergens": [],
      "source": {
        "api": "foodoscope",
        "url": "https://...",
        "originalId": "recipe_12345"
      },
      "score": 85,
      "reasoning": "Excellent protein match • Low sugar • Vegetarian-friendly"
    }
  ]
}
```

---

### 2. Search Recipes
**GET** `/recipes/search?q=pasta&cuisineType=italian&limit=20`

**Query Parameters:**
- `q` (required): Search query
- `cuisineType` (optional): Filter by cuisine
- `difficulty` (optional): easy, medium, hard
- `limit` (optional): Results per page (default: 20)

**Response:** List of ranked recipes matching query

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/recipes/search?q=pasta&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

### 3. Get Recipes by Cuisine
**GET** `/recipes/cuisine/italian?limit=20`

**Path Parameters:**
- `cuisineType`: Cuisine type (italian, mexican, asian, american, etc.)

**Query Parameters:**
- `limit` (optional): Number of recipes (default: 20)

**Response:** Recipes ranked for user's preferences

---

### 4. Get Recipe Details
**GET** `/recipes/id/:recipeId`

**Response (200 OK):**
```json
{
  "success": true,
  "recipe": {
    "id": "recipe_12345",
    "name": "Vegetarian Buddha Bowl",
    "description": "Nutritious bowl...",
    "nutrition": { ... },
    "ingredients": [ ... ],
    "instructions": [ ... ],
    "allergens": []
  },
  "isFavorite": false
}
```

---

### 5. View Nutrition Rules
**GET** `/recipes/rules/nutrition`

**Response (200 OK):**
```json
{
  "success": true,
  "rules": {
    "goals": [
      "fitness",
      "weight_loss",
      "general_wellness",
      "diabetes",
      "heart_health"
    ],
    "conditions": [
      "hypertension",
      "diabetes",
      "obesity",
      "high_cholesterol",
      "kidney_disease"
    ],
    "rules": {
      "goals": {
        "fitness": {
          "calorieLimit": 2200,
          "proteinTarget": 150,
          "sugarLimit": 50,
          "sodiumLimit": 2300,
          "description": "Optimized for muscle building and fitness"
        },
        ...
      },
      "conditions": {
        ...
      }
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Profile setup required. Please complete onboarding.",
  "redirectTo": "/profile/setup"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Recipe not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Testing Workflow

### 1. Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123456",
    "firstName": "Demo",
    "lastName": "User"
  }'
```

Save the returned `token`.

### 2. Complete profile
```bash
curl -X POST http://localhost:5000/api/profile/setup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "weight_loss",
    "dietType": "vegetarian",
    "allergies": ["peanuts"],
    "healthConditions": []
  }'
```

### 3. Get recommendations
```bash
curl -X GET "http://localhost:5000/api/recipes/recommendations?limit=5" \
  -H "Authorization: Bearer <token>"
```

### 4. Search recipes
```bash
curl -X GET "http://localhost:5000/api/recipes/search?q=salad&limit=5" \
  -H "Authorization: Bearer <token>"
```

---

## Notes

- All timestamps are in UTC ISO 8601 format
- Nutrition values are per serving (adjust by `servings` field)
- Scores range from 0-100+, where 100+ indicates excellent match
- Recipe IDs are unique per source API
- Cache is automatically invalidated after 1 hour
