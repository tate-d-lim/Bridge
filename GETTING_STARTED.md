# 🚀 Getting Started with Bridge

Welcome to Bridge! This guide will get you up and running in under 10 minutes.

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

### Step 2: Configure Firebase (5 minutes)
1. Create a Firebase project at https://console.firebase.google.com/
2. Copy your Firebase config
3. Update `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← Paste your values here
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### Step 3: Run the App (1 minute)
```bash
npm run dev
```

🎉 Your app is now running at http://localhost:5173

## 📚 What's Next?

### First-Time Setup
1. **Register an Account**: Go to `/register`
   - Try both "Job Seeker" and "Employer" roles
   
2. **Explore the Features**:
   - Job Seeker: Browse jobs, take quizzes, apply for positions
   - Employer: Post jobs, browse candidates, manage applications

### Learn More
- 📖 **[README.md](README.md)** - Full documentation
- 🔥 **[FIREBASE_CONFIG.md](FIREBASE_CONFIG.md)** - Detailed Firebase setup
- 📋 **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete feature list
- 🛠️ **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step instructions

## 🎯 Quick Feature Tour

### For Job Seekers
```
Register → Browse Jobs → Apply → Take Quizzes → Earn Badges → Chat with Employers
```

### For Employers
```
Register → Post Jobs → Browse Candidates → Review Applications → Chat with Candidates
```

## 📁 Project Structure Overview

```
src/
├── views/              # 14 page components
│   ├── Home.vue       # Landing page
│   ├── Login.vue      # Authentication
│   ├── JobListings.vue
│   ├── JobSeekerDashboard.vue
│   ├── EmployerDashboard.vue
│   └── ...
├── components/        # Reusable components
├── router/           # Navigation routes
├── store/            # State management (Vuex)
│   └── modules/      # Auth, Jobs, Chat, etc.
├── firebase/         # Firebase config
└── services/         # API services
```

## ✅ What's Included

- ✅ Complete authentication system
- ✅ Job posting and browsing
- ✅ User profiles (Job Seeker & Employer)
- ✅ Real-time chat
- ✅ Quiz system with badges
- ✅ Application tracking
- ✅ Responsive design
- ✅ Modern UI/UX

## 🐛 Common Issues

### "Firebase not configured"
→ Update `src/firebase/config.js` with your Firebase credentials

### "Port already in use"
→ Change port in `vite.config.js` or kill the process using port 5173

### "Module not found"
→ Run `npm install` again

## 🎨 Customization Tips

### Change Colors
Edit `src/style.css`:
```css
:root {
  --primary-color: #3498db;    /* Change this */
  --secondary-color: #2c3e50;  /* And this */
}
```

### Update Logo
Replace `src/assets/bridgeLogo.png` with your logo

### Modify Routes
Edit `src/router/index.js` to add/remove routes

## 📞 Need Help?

1. Check the documentation files
2. Review browser console for errors
3. Verify Firebase configuration
4. Check Firestore security rules

## 🚢 Ready to Deploy?

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy

# Or deploy to Vercel
vercel
```

---

**Happy Coding! 🎉**

Need more details? Check out the other documentation files in this project.

