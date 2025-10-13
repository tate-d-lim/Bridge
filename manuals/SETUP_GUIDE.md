# Bridge - Quick Setup Guide

This guide will help you get the Bridge application up and running quickly.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Firebase

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "bridge-app" (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

### Create Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose a location (closest to your users)
5. Click "Enable"

### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app with a nickname (e.g., "Bridge Web")
5. Copy the `firebaseConfig` object

### Configure the Application

Open `src/firebase/config.js` and replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bridge-app.firebaseapp.com",
  projectId: "bridge-app",
  storageBucket: "bridge-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}
```

## Step 3: Set Up Firestore Collections

In the Firebase Console, go to Firestore Database and create these collections (they'll be created automatically when you use the app, but you can create them manually):

1. **users** - User profiles
2. **jobs** - Job listings
3. **applications** - Job applications
4. **chats** - Chat conversations
5. **quizzes** - Quiz data (optional)
6. **badges** - User badges (optional)

## Step 4: Update Firestore Security Rules

Go to **Firestore Database > Rules** and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Jobs - anyone can read, only employers can create/update
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.employerId == request.auth.uid;
    }
    
    // Applications
    match /applications/{applicationId} {
      allow read, write: if request.auth != null;
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Quizzes and badges
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /badges/{badgeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Click "Publish"

## Step 5: Run the Application

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Step 6: Test the Application

1. **Register a New Account**
   - Go to `http://localhost:5173/register`
   - Choose "Job Seeker" or "Employer"
   - Fill in the registration form
   - Click "Create Account"

2. **Login**
   - Go to `http://localhost:5173/login`
   - Enter your email and password
   - Click "Sign In"

3. **Test Features**
   - Browse jobs at `/jobs`
   - View your dashboard
   - Update your profile
   - Try posting a job (as employer)
   - Take a quiz (as job seeker)

## Troubleshooting

### Error: Firebase configuration not found
- Make sure you've updated `src/firebase/config.js` with your Firebase credentials

### Error: Permission denied
- Check your Firestore security rules
- Make sure you're logged in
- Verify your Firebase project settings

### Port already in use
- Change the port in `vite.config.js`:
  ```javascript
  export default defineConfig({
    server: {
      port: 3000 // or any available port
    }
  })
  ```

### Module not found errors
- Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Next Steps

1. **Customize the Design**
   - Update colors in `src/style.css`
   - Modify component styles
   - Add your own logo to `src/assets/`

2. **Add More Features**
   - Implement Gemini AI quiz generation
   - Add email notifications
   - Create a backend API for advanced features
   - Add file upload for resumes

3. **Deploy Your App**
   - Build for production: `npm run build`
   - Deploy to Firebase Hosting, Vercel, or Netlify

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Review Firebase Console for authentication/database issues
3. Refer to the main README.md for detailed documentation

Happy coding! 🚀

