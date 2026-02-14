# Foodoscope Frontend

A Modern React application for personalized food and recipe recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14
- npm or yarn

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Update `.env` with backend URL:**
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Start development server:**
```bash
npm run dev
```

App runs on `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Main navigation layout
│   │   ├── ProtectedRoute.jsx   # Route protection wrapper
│   │   └── RecipeCard.jsx       # Recipe display component
│   ├── context/
│   │   ├── AuthContext.jsx      # Auth state management
│   │   └── RecipeContext.jsx    # Recipe state management
│   ├── pages/
│   │   ├── HomePage.jsx         # Landing page
│   │   ├── LoginPage.jsx        # Login form
│   │   ├── RegisterPage.jsx     # Registration form
│   │   ├── ProfileSetupPage.jsx # Onboarding form
│   │   ├── ProfilePage.jsx      # User profile & settings
│   │   ├── RecipesPage.jsx      # Personalized recommendations
│   │   ├── SearchPage.jsx       # Recipe search
│   │   └── FavoritesPage.jsx    # Saved recipes
│   ├── utils/
│   │   └── apiClient.js         # Axios instance with auth
│   ├── App.jsx                  # App routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles & Tailwind
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
├── package.json                 # Dependencies
└── .env.example                 # Environment template
```

## 🎨 Key Features

### 1. Authentication System
- User registration & login
- JWT token stored in localStorage
- Automatic token injection in all API calls
- Automatic redirect on token expiration

### 2. User Profile Management
- Onboarding form after first login
- Profile editing capabilities
- Nutrition constraints display
- Health conditions tracking
- Allergy management

### 3. Recipe Recommendations
- Personalized recipe suggestions
- Backend-filtered & ranked recipes
- Nutrition information display
- Scoring visualization
- Favorite recipes management

### 4. Recipe Search
- Advanced search with filters
- Cuisine type filtering
- Difficulty level filtering
- Real-time search results

### 5. State Management
- React Context for Auth
- React Context for Recipes
- Custom hooks (useAuth, useRecipe)
- localStorage for persistence

## 🔧 Key Technologies

- **Vite** - Fast build tool
- **React 18** - UI library
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **Context API** - State management

## 📖 Page Descriptions

### HomePage
Landing page with features and CTA buttons. No authentication required.

### LoginPage
User login form. Handles JWT token and redirects based on profile completion.

### RegisterPage
New user registration. Collects email, password, and basic info.

### ProfileSetupPage
Onboarding form for health goals, diet preferences, and allergies.

### ProfilePage
User profile dashboard with:
- Personal information
- Health goals
- Nutrition targets
- Allergy information
- Profile editing capability

### RecipesPage
Personalized recipe recommendations with:
- Configurable result limit
- Diverse cuisine option
- Nutrition information
- Favorite toggle
- Scoring explanation

### SearchPage
Advanced recipe search with:
- Query input
- Cuisine filtering
- Difficulty filtering
- Real-time results

### FavoritesPage
Display saved recipes with ability to remove from favorites.

## 🔗 API Integration

### Auth Endpoints
```javascript
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Profile Endpoints
```javascript
POST /api/profile/setup
GET /api/profile
PUT /api/profile/update
POST /api/profile/favorites/add
DELETE /api/profile/favorites/remove
GET /api/profile/favorites
```

### Recipe Endpoints
```javascript
GET /api/recipes/recommendations
GET /api/recipes/search
GET /api/recipes/cuisine/:cuisineType
GET /api/recipes/id/:recipeId
GET /api/recipes/rules/nutrition
```

## 🎯 User Flow

```
1. User visits home page
   ↓
2. User registers or logs in
   ↓
3. First-time users → Profile Setup
   ↓
4. Profile Complete → Recipe Recommendations
   ↓
5. User can:
   - View recommendations
   - Search recipes
   - Save favorites
   - Update profile
```

## 🔒 Security Features

- JWT token-based authentication
- Token stored securely in localStorage
- Automatic token injection in API headers
- Protected routes (require authentication)
- Protected recipe routes (require profile completion)
- Automatic redirect on token expiration
- Password validation on registration

## 🎨 Styling Approach

- **Tailwind CSS** for utility-first styling
- **Responsive design** with mobile-first approach
- **Color scheme:**
  - Primary: `#10B981` (Green)
  - Secondary: `#06B6D4` (Cyan)
  - Danger: `#EF4444` (Red)
  - Warning: `#F59E0B` (Orange)

## 🚀 Building for Production

1. **Build the project:**
```bash
npm run build
```

2. **Preview the build:**
```bash
npm run preview
```

3. **Deploy to hosting service:**
   - Vercel (recommended)
   - Netlify
   - GitHub Pages
   - AWS Amplify

## 📝 Environment Variables

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### JWT Token Issues
- Clear browser localStorage
- Logout and re-login
- Check token format in Network tab

### Styling Issues
- Run `npm install` to ensure Tailwind is installed
- Clear `.vite` cache: `rm -rf .vite`
- Rebuild: `npm run dev`

## 🔄 Development Workflow

1. **Start backend:**
```bash
cd ..
npm run dev
```

2. **Start frontend (in new terminal):**
```bash
cd frontend
npm run dev
```

3. **Access application:**
```
http://localhost:3000
```

## 📚 Component Usage Examples

### Using useAuth Hook
```javascript
import { useAuth } from '../context/AuthContext';

export const MyComponent = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Hello, {user.firstName}!</div>;
};
```

### Using useRecipe Hook
```javascript
import { useRecipe } from '../context/RecipeContext';

export const MyComponent = () => {
  const { recommendations, loading, fetchRecommendations } = useRecipe();

  useEffect(() => {
    fetchRecommendations(10);
  }, []);

  if (loading) return <LoadingSpinner />;

  return <RecipeGrid recipes={recommendations} />;
};
```

### Using ProtectedRoute
```javascript
<Route
  path="/recipes"
  element={
    <ProtectedRoute requireProfileComplete={true}>
      <RecipesPage />
    </ProtectedRoute>
  }
/>
```

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

## 📊 Statistics

- **Components:** 8
- **Pages:** 8
- **Context Providers:** 2
- **Line Count:** ~2500+
- **Dependencies:** 6

## 🤝 Contributing

While this is a hackathon project, improvements are welcome:
- Bug fixes
- UI enhancements
- Performance optimizations
- Accessibility improvements

## 📄 License

MIT

## 🎉 Credits

Built for personalized nutrition recommendations using Foodoscope APIs.

---

**Questions?** Check the [API Documentation](../API_DOCUMENTATION.md) or [Architecture Guide](../ARCHITECTURE.md)
