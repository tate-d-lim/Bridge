# 👥 Developer Setup Guide

## For New Team Members Cloning This Project

When you clone this repository, certain files are intentionally excluded from Git for security reasons. This guide will help you set up your local environment.

## 🔐 Missing Files (Git Ignored)

After cloning, you'll need to create these files:

1. `.env` - Environment variables
2. `firebase_private_key.json` - Firebase service account (backend only)
3. `backend/node_modules` - Backend dependencies
4. `node_modules` - Frontend dependencies

## 📋 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Bridge
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Create Environment File

Create a `.env` file in the project root:

```bash
# On Mac/Linux
touch .env

# On Windows
type nul > .env
```

Copy the template from `.env.example` (if provided) or use this structure:

```env
# ============================================
# FRONTEND Firebase Configuration (Safe for Browser)
# ============================================
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# ============================================
# BACKEND Configuration (Server-side ONLY!)
# ============================================
# Gemini AI API Key (for quiz generation - Backend only)
GEMINI_API_KEY=

# Backend API URL
VITE_API_URL=http://localhost:3000
```

### Step 4: Get Firebase Credentials

Ask your **project administrator** for:

1. **Firebase Web App Configuration** (for `.env` file)
   - They can find this in: Firebase Console → Project Settings → Your apps → Web app
   - Copy all values starting with `VITE_FIREBASE_*`

2. **Gemini API Key** (for `.env` file)
   - They should provide: `GEMINI_API_KEY`

3. **Firebase Service Account Key** (for backend)
   - They will provide: `firebase_private_key.json`
   - Place it in the project root: `./firebase_private_key.json`

### Step 5: Configure Your .env File

Update the `.env` file with the credentials provided by your admin:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxx
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
VITE_API_URL=http://localhost:3000
```

### Step 6: Add Firebase Service Account

If you're running the backend (most developers will need this):

1. Get `firebase_private_key.json` from your admin
2. Place it in the project root:
   ```
   Bridge/
   ├── firebase_private_key.json  ← Here
   ├── .env
   ├── backend/
   └── src/
   ```

### Step 7: Verify Setup

Check that everything is in place:

```bash
# Check .env exists and has content
cat .env

# Check Firebase service account exists
ls -la firebase_private_key.json

# Verify dependencies are installed
ls node_modules
ls backend/node_modules
```

### Step 8: Run the Application

Start both servers:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 9: Test the Setup

1. Backend health check:
   ```bash
   curl http://localhost:3000/health
   ```

2. Open frontend:
   ```
   http://localhost:5173
   ```

3. Try registering a new account

## 🔑 How to Get Credentials

### Option 1: From Project Administrator

Contact the project lead and request:
- Firebase Web Configuration
- Gemini API Key
- Firebase Service Account JSON

### Option 2: Create Your Own (For Development)

If you need your own test environment:

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create Firestore Database

2. **Get Firebase Web Config:**
   - Project Settings → Your apps → Web app
   - Copy the configuration

3. **Get Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key

4. **Download Service Account:**
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `firebase_private_key.json`

## 📂 Expected File Structure

After setup, you should have:

```
Bridge/
├── .env ✅                          # Created by you
├── firebase_private_key.json ✅     # From admin or generated
├── node_modules/ ✅                 # After npm install
│
├── backend/
│   ├── node_modules/ ✅             # After npm install
│   ├── server.js
│   └── package.json
│
├── src/
│   ├── firebase/config.js           # Uses .env automatically
│   └── ...
│
└── .gitignore                       # Contains rules for ignored files
```

## 🔒 Security Reminders

### ✅ Do This:
- ✅ Keep `.env` file private (already in .gitignore)
- ✅ Keep `firebase_private_key.json` secure (already in .gitignore)
- ✅ Use different credentials for dev/staging/production
- ✅ Regularly rotate API keys

### ❌ Never Do This:
- ❌ Commit `.env` to Git
- ❌ Commit `firebase_private_key.json` to Git
- ❌ Share credentials in public channels
- ❌ Push API keys to GitHub

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall dependencies
npm install
cd backend && npm install && cd ..
```

### "Firebase configuration missing"
```bash
# Check .env file exists and has values
cat .env

# Ensure all VITE_FIREBASE_* variables are set
```

### "GEMINI_API_KEY not found"
```bash
# Check .env file has GEMINI_API_KEY
grep GEMINI_API_KEY .env

# Make sure there's no space around the =
# Correct: GEMINI_API_KEY=AIzaSy...
# Wrong:   GEMINI_API_KEY = AIzaSy...
```

### "Cannot find firebase_private_key.json"
```bash
# Check file exists in project root (not in backend folder)
ls -la firebase_private_key.json

# If missing, get it from your admin
```

### Backend won't start
```bash
# Make sure you're in the backend folder
cd backend

# Check if node_modules exists
ls node_modules

# If not, install dependencies
npm install

# Try starting again
npm run dev
```

### Port already in use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## 📞 Need Help?

1. Check if `.env` file exists and has all values
2. Verify `firebase_private_key.json` is in project root
3. Ensure dependencies are installed (`node_modules` folders exist)
4. Review error messages in terminal
5. Contact your project administrator

## 📚 Additional Resources

- `README.md` - Full project documentation
- `ENVIRONMENT_SETUP.md` - Detailed environment guide
- `FIREBASE_CONFIG.md` - Firebase configuration details
- `backend/README.md` - Backend API documentation

## ✅ Setup Checklist

Before you start developing, ensure:

- [ ] Repository cloned
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] `.env` file created in project root
- [ ] All environment variables filled in `.env`
- [ ] `firebase_private_key.json` in project root
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Can access http://localhost:5173
- [ ] Can register a test account

---

**Welcome to the team! Happy coding! 🚀**

