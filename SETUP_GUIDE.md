# Full Stack Development Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Setting Up Both Backend and Frontend](#setting-up-both-backend-and-frontend)
3. [Running the Complete Application](#running-the-complete-application)
4. [Common Issues and Solutions](#common-issues-and-solutions)
5. [Development Tips](#development-tips)
6. [Project Structure](#project-structure)

## 🎯 Project Overview

This is a full-stack application for personalized food and recipe recommendations.

- **Backend:** Node.js + Express + MongoDB
- **Frontend:** React + Vite + Tailwind CSS
- **API:** RESTful with JWT authentication

## 🔧 Setting Up Both Backend and Frontend

### Prerequisites for Both
- Node.js >= 14
- npm or yarn
- MongoDB (local or Atlas)

### Step 1: Project Structure Setup

```bash
# The project should have this structure:
Hackathon/
├── src/                    # Backend source code
├── server.js               # Backend entry point
├── package.json            # Backend dependencies
├── .env.example            # Backend env template
├── .env                    # Backend env (create from .env.example)
├── frontend/               # React frontend
│   ├── src/                # Frontend source
│   ├── package.json        # Frontend dependencies
│   ├── .env.example        # Frontend env template
│   ├── .env                # Frontend env (create from .env.example)
│   ├── vite.config.js      # Vite configuration
│   └── index.html          # HTML entry point
└── README.md               # This file
```

### Step 2: Backend Setup

```bash
# Navigate to project root
cd Hackathon

# Install backend dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your settings:
# - MONGODB_URI
# - JWT_SECRET
# - FOODOSCOPE_API_KEY (optional for demo)
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create .env file from template
cp .env.example .env

# Verify .env has correct API URL
# VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Complete Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd Hackathon
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd Hackathon/frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### Option 2: Run from Project Root (Linux/Mac)

```bash
# Start both with a single command using bash
npm run dev & cd frontend && npm run dev
```

## 📊 Complete Application Flow

```
User Browser (http://localhost:3000)
        ↓
React Frontend (Vite dev server)
        ↓
HTTP/REST API (http://localhost:5000/api)
        ↓
Express Server
        ↓
MongoDB Database
        ↓
Foodoscope API (external)
```

## 🧪 Testing the Application

### 1. Test Registration
```bash
# Open http://localhost:3000
# Click "Register"
# Fill form with:
# - Email: test@example.com
# - Password: test123456
# - First Name: Test
# - Last Name: User
# Click "Register"
```

### 2. Test Profile Setup
- You should be redirected to `/profile/setup`
- Select:
  - Goal: "Weight Loss"
  - Diet Type: "Vegetarian"
  - Allergies: "peanuts" (optional)
- Click "Continue to Recipes"

### 3. Test Recommendations
- You should see personalized recipe recommendations
- Try different filters (limit, diverse)
- Click heart icon to favorite recipes

### 4. Test Search
- Navigate to search page
- Search for "pasta" or "healthy"
- Try filters: cuisine, difficulty

### 5. Test Profile Management
- Go to Profile page
- View your nutrition targets
- Click "Edit Profile" to make changes

## 🔍 Common Issues and Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check if MongoDB is running
# For local MongoDB:
mongod

# Or use MongoDB Atlas:
# Update MONGODB_URI in .env to your Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/foodoscope
```

### Issue: "CORS Error" when frontend calls backend
**Solution:**
- Ensure backend is running on `http://localhost:5000`
- Check VITE_API_URL in frontend `.env`
- Verify CORS_ORIGIN in backend `.env` is `http://localhost:3000`
- Restart both servers

### Issue: "Cannot find module" errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or for frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Token undefined" or auth not working
**Solution:**
- Clear browser localStorage: F12 → Application → localStorage → clear all
- Logout and re-login
- Check Network tab to see if Authorization header is being sent

### Issue: "API key missing" for Foodoscope
**Solution:**
- For development, you can use mock data
- The app has graceful fallbacks if API fails
- Add a valid API key to `.env` when ready

### Issue: Frontend won't connect to backend
**Solution:**
```bash
# Check if backend is running:
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"message":"Server is running",...}

# If not, restart backend:
cd Hackathon
npm run dev
```

## 💡 Development Tips

### Debugging

**Backend Logs:**
- Check terminal where backend is running
- Logs show all API calls and errors

**Frontend Console:**
- Open DevTools (F12)
- Check Console for JavaScript errors
- Check Network tab for API calls

**Network Inspection:**
- Open DevTools → Network tab
- Make a request and inspect:
  - Status code
  - Response body
  - Request headers (especially Authorization)

### Hot Reload

**Frontend (Automatic):**
```bash
cd frontend
npm run dev
# Changes to .jsx files automatically reload
```

**Backend (with nodemon):**
```bash
npm run dev
# Changes to .js files automatically restart server
```

### Making API Calls

**In Components:**
```javascript
import apiClient from '../utils/apiClient';

// GET request
const response = await apiClient.get('/recipes/recommendations');

// POST request
const response = await apiClient.post('/profile/setup', {
  goal: 'fitness',
  dietType: 'vegetarian',
});

// PUT request
const response = await apiClient.put('/profile/update', { /* data */ });
```

Token is automatically added to all requests via axios interceptor.

### Adding New Features

**1. Add Backend Route:**
```javascript
// In src/routes/newRoutes.js
router.get('/endpoint', verifyToken, controllerFunction);

// Add to src/app.js
import newRoutes from './routes/newRoutes.js';
app.use('/api/new', newRoutes);
```

**2. Add Frontend Page:**
```javascript
// In src/pages/NewPage.jsx
export const NewPage = () => {
  const { user } = useAuth();
  // Component code
};

// In src/App.jsx
<Route path="/new" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

## 📁 Project Structure Details

### Backend Structure
```
src/
├── config/           # Configuration & DB connection
├── models/           # Database models (User, etc.)
├── middleware/       # Auth, error handling
├── services/         # Business logic (nutrition engine, API clients)
├── controllers/      # Route handlers
├── routes/           # API route definitions
├── utils/            # Helper functions
└── app.js            # Express app setup
```

### Frontend Structure
```
src/
├── components/       # Reusable UI components
├── context/          # React Context for state
├── pages/            # Full-page components
├── utils/            # Helper functions & API client
├── App.jsx           # Main app component with routing
└── index.css         # Global styles
```

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys in frontend code
- [ ] JWT tokens stored securely (localStorage)
- [ ] Password hashed with bcrypt (backend)
- [ ] All routes protected where needed
- [ ] CORS configured correctly
- [ ] Input validation on both sides

## 📈 Performance Tips

**Frontend:**
- Use React DevTools for profiling
- Minimize re-renders with Context
- Lazy load routes for split bundling
- Optimize images and assets

**Backend:**
- Use database indexing
- Implement caching for API responses
- Use connection pooling for MongoDB
- Monitor memory usage

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# From frontend directory
cd frontend
vercel

# Will prompt for configuration
# Set API URL to your backend
```

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Create app
heroku create your-app-name

# Set env variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-atlas-url>
heroku config:set JWT_SECRET=<strong-secret>

# Deploy
git push heroku main
```

## 📚 Helpful Resources

- [Backend README](./README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Guide](./ARCHITECTURE.md)

---

## ✅ Quick Start Checklist

- [ ] Clone/create project structure
- [ ] Install backend dependencies: `npm install`
- [ ] Install frontend dependencies: `cd frontend && npm install`
- [ ] Create `.env` in root with MongoDB URI
- [ ] Create `.env` in frontend with API URL
- [ ] Start MongoDB (local or Atlas)
- [ ] Run backend: `npm run dev`
- [ ] Run frontend: `cd frontend && npm run dev`
- [ ] Open http://localhost:3000
- [ ] Register and test the application

---

**Everything set up? Start building! 🎉**
