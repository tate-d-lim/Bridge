# 🔐 Environment & Security Setup Guide

## ✅ What's Been Configured

Your Bridge application is now fully configured with:

### 1. **Frontend Environment Variables** (.env)
```env
✅ Firebase Web Configuration (Safe for browser)
✅ Gemini API Key (Backend only - DO NOT use in frontend!)
✅ API URL for backend communication
```

### 2. **Backend Server** (Node.js + Express)
```
✅ Gemini AI integration for quiz generation
✅ Firebase Admin SDK for server-side operations
✅ RESTful API endpoints
✅ CORS configured for frontend access
```

### 3. **Security Setup**
```
✅ Service account key (firebase_private_key.json) - Protected
✅ API keys in .env - Protected
✅ All sensitive files in .gitignore
```

## 🚀 How to Run Your Application

### Step 1: Start the Backend Server

```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm run dev
```

The backend will run on: **http://localhost:3000**

### Step 2: Start the Frontend (New Terminal)

```bash
# In the project root (not in backend folder)
npm run dev
```

The frontend will run on: **http://localhost:5173**

## 📁 File Structure

```
Bridge/
├── .env                          ✅ Environment variables (PROTECTED)
├── firebase_private_key.json     ✅ Service account (PROTECTED)
│
├── backend/                      # Backend Server
│   ├── server.js                # Express server with Gemini AI
│   ├── package.json
│   └── README.md
│
└── src/                          # Frontend Vue.js App
    ├── firebase/
    │   └── config.js            # Uses .env variables
    └── services/
        └── api.js               # Calls backend API
```

## 🔑 Environment Variables Explained

### Frontend Variables (Safe for Browser)
These are prefixed with `VITE_` and can be used in Vue components:

```env
VITE_FIREBASE_API_KEY=AIzaSyBQNi9AsWsc0dGhmxEidmXUvUacLIPDqvU
VITE_FIREBASE_AUTH_DOMAIN=match-789c3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=match-789c3
# ... etc
```

**Usage in Vue:**
```javascript
// This is safe - these are public Firebase client keys
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
```

### Backend Variables (Server-side ONLY!)
These should NEVER be exposed to the browser:

```env
GEMINI_API_KEY=AIzaSyDH_E7OP4fzmS9aZ-ANNcDl5IiWq3kCzHY
```

**Usage in Backend:**
```javascript
// Only in backend/server.js
const apiKey = process.env.GEMINI_API_KEY
```

## 🤖 Gemini AI Integration

### How It Works

1. **Frontend** → Requests quiz generation
2. **Backend** → Calls Gemini AI with your API key (secure)
3. **Gemini AI** → Generates quiz questions
4. **Backend** → Saves to Firestore and returns to frontend
5. **Frontend** → Displays quiz to user

### Generate a Quiz

From the frontend:
```javascript
import { quizApi } from '@/services/api'

const quiz = await quizApi.generateQuiz({
  skill: 'Construction',
  difficulty: 'beginner',
  numberOfQuestions: 10
})
```

This calls your backend, which securely uses Gemini AI!

## 🔒 Security Best Practices

### ✅ What's Protected
- `.env` file → In .gitignore
- `firebase_private_key.json` → In .gitignore
- Backend node_modules → In .gitignore
- Gemini API key → Only in backend

### ❌ What NOT to Do
- ❌ Don't import `GEMINI_API_KEY` in Vue components
- ❌ Don't commit `.env` to Git
- ❌ Don't share `firebase_private_key.json`
- ❌ Don't use Firebase Admin SDK in frontend

### ✅ What You CAN Do
- ✅ Use Firebase Web SDK in frontend (already set up)
- ✅ Call backend API from frontend
- ✅ Use Gemini AI through backend endpoints
- ✅ Use Firebase Admin SDK in backend

## 🧪 Testing the Setup

### 1. Test Backend Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

### 2. Test Quiz Generation
```bash
curl -X POST http://localhost:3000/api/quizzes/generate \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "Construction",
    "difficulty": "beginner",
    "numberOfQuestions": 5
  }'
```

Expected: JSON with generated quiz questions

### 3. Test Frontend
1. Open http://localhost:5173
2. Register as a Job Seeker
3. Go to Quizzes page
4. Try to generate a quiz (will call backend)

## 📊 API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/quizzes/generate` | POST | Generate quiz with Gemini AI |
| `/api/quizzes` | GET | Get all quizzes |
| `/api/quizzes/:id` | GET | Get quiz by ID |
| `/api/quizzes/results` | POST | Submit quiz result |
| `/api/user/profile` | GET | Get user profile (protected) |

## 🐛 Troubleshooting

### Backend won't start
```bash
# Make sure you're in the backend folder
cd backend

# Install dependencies
npm install

# Check if firebase_private_key.json exists in project root
ls -la ../firebase_private_key.json
```

### "Cannot find module"
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd .. && npm install
```

### "Gemini API error"
- Verify `GEMINI_API_KEY` in `.env`
- Check you have Gemini API access
- Ensure API key is valid

### "Firebase error"
- Check Firebase config in `.env`
- Verify `firebase_private_key.json` is in project root
- Ensure Firestore is enabled in Firebase Console

## 📝 Quick Commands Cheat Sheet

```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
npm run dev

# Install all dependencies
npm install && cd backend && npm install && cd ..

# Check environment variables
cat .env

# Test backend
curl http://localhost:3000/health
```

## 🎯 Next Steps

1. ✅ Start backend server
2. ✅ Start frontend application
3. ✅ Test quiz generation feature
4. ✅ Configure Firestore security rules
5. ✅ Deploy when ready!

---

**Security Reminder**: Never commit `.env` or `firebase_private_key.json` to version control! ⚠️

