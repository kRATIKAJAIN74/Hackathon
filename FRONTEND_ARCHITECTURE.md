# Frontend Architecture & Component Design

## 🏗️ React Component Structure

```
App.jsx (Router)
├─ AuthContext.Provider
├─ RecipeProvider
└─ Routes
   ├─ HomePage (public)
   ├─ LoginPage (public)
   ├─ RegisterPage (public)
   ├─ ProfileSetupPage (protected)
   │  └─ Layout
   │     └─ ProfileSetupForm
   ├─ ProfilePage (protected)
   │  └─ Layout
   │     └─ ProfileDisplay / ProfileEditForm
   ├─ RecipesPage (protected + profile complete)
   │  └─ Layout
   │     ├─ RecipeFilters
   │     └─ RecipeGrid
   │        └─ RecipeCard [] (reusable)
   ├─ SearchPage (protected + profile complete)
   │  └─ Layout
   │     ├─ SearchForm
   │     └─ RecipeGrid
   │        └─ RecipeCard []
   └─ FavoritesPage (protected + profile complete)
      └─ Layout
         └─ RecipeGrid
            └─ RecipeCard []
```

## 🎪 Layout Component

```jsx
Layout
├─ Navigation Bar
│  ├─ Logo (Foodoscope)
│  ├─ Nav Links (conditional on auth)
│  ├─ User Menu (if authenticated)
│  └─ Mobile Menu Toggle
├─ Main Content (children)
└─ Footer
```

## 🔐 Context Providers

### AuthContext
```javascript
{
  user: {
    _id: String,
    email: String,
    firstName: String,
    lastName: String,
    profileCompleted: Boolean,
    profile: { goal, dietType, allergies, healthConditions, nutritionConstraints },
  },
  token: String | null,
  loading: Boolean,
  isAuthenticated: Boolean,
  
  methods: {
    register(email, password, firstName, lastName),
    login(email, password),
    logout(),
    updateUser(updatedUser),
  }
}
```

### RecipeContext
```javascript
{
  recipes: RecipeObject[],
  recommendations: RecipeObject[],
  favorites: String[], // recipe IDs
  loading: Boolean,
  error: String | null,
  
  methods: {
    fetchRecommendations(limit, diverse),
    searchRecipes(query, filters, limit),
    getRecipesByCuisine(cuisine, limit),
    getRecipeDetail(recipeId),
    addFavorite(recipeId),
    removeFavorite(recipeId),
    fetchFavorites(),
  }
}
```

## 📦 Recipe Card Component

```
RecipeCard
├─ Image Container
│  ├─ Recipe Image
│  ├─ Favorite Button (heart)
│  └─ Score Badge
├─ Content Section
│  ├─ Recipe Name
│  ├─ Description (truncated)
│  ├─ Badges (difficulty, cuisine)
│  ├─ Nutrition Grid (4 cells)
│  │  ├─ Calories
│  │  ├─ Protein
│  │  ├─ Sugar
│  │  └─ Sodium
│  └─ Timing (if available)
└─ Hover Effects
   ├─ Shadow elevation
   └─ Image zoom
```

## 🚀 State Management Flow

```
USER ACTION (button click)
        │
        ▼
DISPATCH FUNCTION
        │
        ├─ Call API via apiClient
        │  └─ Token auto-added by interceptor
        │
        ├─ SET LOADING STATE
        │
        ├─ ON SUCCESS
        │  └─ UPDATE CONTEXT STATE
        │  └─ Show success message (optional)
        │
        └─ ON ERROR
           └─ SET ERROR STATE
           └─ Show error message
           └─ Clear on new action

CONTEXT STATE UPDATE
        │
        ▼
COMPONENT RE-RENDER
        │
        ▼
UI UPDATES (cards, forms, etc.)
```

## 🔄 Data Flow Example: Search

```
SearchPage Component
    │
    ├─ useState: query, cuisine, difficulty
    │
    ├─ Form submit
    │  └─ handleSearch()
    │     └─ Validate input
    │     └─ Build filters object
    │     └─ Call useRecipe().searchRecipes(q, filters, limit)
    │        │
    │        ├─ apiClient.get('/recipes/search', {params})
    │        │  │
    │        │  ├─ Interceptor adds Authorization header
    │        │  │
    │        │  └─ Express backend processes
    │        │     └─ Returns ranked recipes
    │        │
    │        └─ setRecipes(response.data.recipes)
    │
    ├─ Watch recipes state
    │  │
    │  └─ Re-render <RecipeGrid recipes={recipes} />
    │        │
    │        └─ Map recipes to RecipeCard components
    │           │
    │           └─ Each card renders nutrition info, score
    │
    └─ User interaction
       └─ Click heart icon
       └─ handleFavoriteToggle()
       └─ Call addFavorite(recipeId)
       └─ Set animating state
       └─ Show success toast (optional)
```

## 💾 localStorage Structure

```javascript
// JWT Token
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIs...');

// Can be extended:
// - User preferences
// - Search history
// - Draft forms
```

## 🎨 Styling Architecture

### Tailwind CSS + Custom CSS

**Utility Classes (Tailwind):**
- `text-primary` (green, #10B981)
- `bg-primary`, `hover:bg-opacity-90`
- `rounded-lg`, `shadow-md`
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `flex items-center justify-between`

**Component Classes (index.css):**
```css
.button-primary { /* reusable button styling */ }
.card { /* reusable card styling */ }
.input-field { /* reusable input styling */ }
.spinner { /* loading animation */ }
.fade-in { /* entrance animation */ }
```

### Responsive Design
- Mobile: 320px+
- Tablet: 768px+ (md:)
- Desktop: 1024px+ (lg:)

## 🔐 Protected Route Logic

```jsx
ProtectedRoute
├─ Check isAuthenticated
│  ├─ FALSE: <Navigate to="/login" />
│  └─ TRUE: Continue
│
├─ If requireProfileComplete={true}
│  ├─ Check user.profileCompleted
│  ├─ FALSE: <Navigate to="/profile/setup" />
│  └─ TRUE: Render children
│
└─ If loading: <LoadingSpinner />

USAGE:
<Route
  path="/recipes"
  element={
    <ProtectedRoute requireProfileComplete={true}>
      <RecipesPage />
    </ProtectedRoute>
  }
/>
```

## 📡 API Interceptor Pattern

```javascript
// apiClient.js - Setup
const apiClient = axios.create({ /* config */ });

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// USAGE: No manual token handling needed
const response = await apiClient.get('/api/profile');
// Token automatically included!
```

## 🎯 Component Lifecycle Patterns

### Page Component with Data Fetching
```javascript
export const RecipesPage = () => {
  const { recommendations, loading, fetchRecommendations } = useRecipe();
  const [limit, setLimit] = useState(10);

  // Fetch on mount and when limit changes
  useEffect(() => {
    fetchRecommendations(limit);
  }, [limit]);

  if (loading) return <LoadingSpinner />;
  
  return (
    <Layout>
      <RecipeGrid recipes={recommendations} />
    </Layout>
  );
};
```

### Form Component with Validation
```javascript
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate(result.redirectTo);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
};
```

## 🌐 Responsive Grid Examples

### 1 Column (Mobile)
```
[Card]
[Card]
[Card]
```

### 2 Columns (Tablet)
```
[Card] [Card]
[Card] [Card]
[Card] [Card]
```

### 3 Columns (Desktop)
```
[Card] [Card] [Card]
[Card] [Card] [Card]
```

HTML:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
</div>
```

## 🚀 Performance Optimization

### Memoization
```javascript
// Prevent unnecessary re-renders
const RecipeCard = React.memo(({ recipe, isFavorite, onFavoriteToggle }) => {
  // Component only re-renders if props change
});
```

### Lazy Loading (Future)
```javascript
// Code splitting for routes
const RecipesPage = lazy(() => import('./pages/RecipesPage'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/recipes" element={<RecipesPage />} />
</Suspense>
```

### Image Optimization (Future)
```javascript
// Use optimized image formats
<img src={recipe.imageUrl} alt={recipe.name} loading="lazy" />
```

## 📝 Error Handling Strategy

```
API ERROR
    │
    ├─ 400 Bad Request
    │  └─ "Invalid search query"
    │
    ├─ 401 Unauthorized
    │  └─ "Please log in again"
    │  └─ Clear token + navigate to login
    │
    ├─ 403 Forbidden
    │  └─ "Complete profile setup first"
    │  └─ Navigate to /profile/setup
    │
    ├─ 404 Not Found
    │  └─ "Recipe not found"
    │
    ├─ 500 Server Error
    │  └─ "Server error, please try again"
    │  └─ Show generic message
    │
    └─ Network Error
       └─ "Unable to connect to server"
       └─ Check backend is running

DISPLAY:
├─ Toast notification (temporary)
├─ Error banner (persistent)
└─ Form field error (specific to field)
```

## 🎬 Animation & Transitions

### CSS Transitions
```css
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

button:hover {
  transition: all 0.3s ease;
}
```

### Loading States
```javascript
{loading && <div className="spinner" />}
{loading && <button disabled>Loading...</button>}
```

### Toast Notifications (Future)
```javascript
// Show temporary success/error messages
showToast('Recipe added to favorites!', 'success', 3000);
showToast('Failed to load recipes', 'error', 5000);
```

## 🔄 Form Pattern

```jsx
const [formData, setFormData] = useState({
  goal: '',
  dietType: '',
  allergies: '',
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  // Validation
  if (!formData.goal || !formData.dietType) {
    setError('All fields required');
    return;
  }

  setLoading(true);
  try {
    const response = await apiClient.post('/profile/setup', formData);
    // Success handling
    updateUser(response.data.user);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed');
  } finally {
    setLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {error && <ErrorBanner message={error} />}
    {/* form fields */}
    <button type="submit" disabled={loading}>
      {loading ? 'Saving...' : 'Save'}
    </button>
  </form>
);
```

---

**Frontend Architecture Document v1.0**
*Built with React, Vite, Tailwind CSS*
