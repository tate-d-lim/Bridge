# Firebase Configuration Guide

This guide will help you configure Firebase for the Bridge application.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `bridge-app` (or your choice)
4. Optional: Disable Google Analytics if not needed
5. Click "Create project"

## 2. Enable Authentication

### Email/Password Authentication
1. In Firebase Console, navigate to **Build > Authentication**
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click on "Email/Password"
5. Enable both toggles:
   - Email/Password ✅
   - Email link (passwordless sign-in) (optional)
6. Click "Save"

## 3. Create Firestore Database

1. Navigate to **Build > Firestore Database**
2. Click "Create database"
3. Choose mode:
   - **Start in test mode** (for development)
   - Location: Select closest to your users (e.g., `asia-southeast1` for Singapore)
4. Click "Enable"

## 4. Set Up Firestore Security Rules

1. Go to **Firestore Database > Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update, delete: if isOwner(userId);
    }
    
    // Jobs collection
    match /jobs/{jobId} {
      allow read: if true; // Public read
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        resource.data.employerId == request.auth.uid;
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.employerId == request.auth.uid
      );
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if isAuthenticated() && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
    
    // Quizzes collection
    match /quizzes/{quizId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admins can modify (use Cloud Functions)
    }
    
    // Quiz results collection
    match /quizResults/{resultId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Badges collection
    match /badges/{badgeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click "Publish"

## 5. Enable Storage (Optional)

If you plan to allow file uploads (resumes, profile pictures):

1. Navigate to **Build > Storage**
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location
5. Click "Done"

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads (resumes, profile pictures)
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Company logos
    match /companies/{companyId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Get Firebase Configuration

1. Go to **Project Settings** (gear icon ⚙️)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app with nickname: "Bridge Web App"
5. Don't check "Firebase Hosting" (unless you plan to use it)
6. Click "Register app"
7. Copy the `firebaseConfig` object

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bridge-app.firebaseapp.com",
  projectId: "bridge-app",
  storageBucket: "bridge-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 7. Update Application Configuration

### Method 1: Direct Configuration (Quick Start)

Open `src/firebase/config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

### Method 2: Environment Variables (Recommended for Production)

1. Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=bridge-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bridge-app
VITE_FIREBASE_STORAGE_BUCKET=bridge-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

2. The app is already configured to use these variables

**Important**: Add `.env` to `.gitignore` (already done)

## 8. Create Initial Collections

### Option 1: Automatic (Recommended)
The collections will be created automatically when you use the app for the first time.

### Option 2: Manual
In Firestore Console, create these collections:

1. **users**
   - Click "Start collection"
   - Collection ID: `users`
   - Add a sample document (will be replaced by real data)

2. **jobs**
   - Collection ID: `jobs`

3. **applications**
   - Collection ID: `applications`

4. **chats**
   - Collection ID: `chats`

5. **quizzes** (Optional)
   - Collection ID: `quizzes`

6. **badges** (Optional)
   - Collection ID: `badges`

## 9. Test Firebase Connection

1. Start your development server:
```bash
npm run dev
```

2. Open browser console (F12)
3. Try to register a new user
4. Check Firestore Database - you should see a new user document

## 10. Set Up Indexes (If Needed)

If you see errors about missing indexes:

1. Click the link in the error message, OR
2. Go to **Firestore Database > Indexes**
3. Create composite indexes as needed

Common indexes needed:
- **jobs**: `createdAt` (Descending) + `status` (Ascending)
- **applications**: `userId` (Ascending) + `createdAt` (Descending)
- **chats**: `participants` (Array) + `lastMessageAt` (Descending)

## 11. Enable Cloud Functions (Optional - For Advanced Features)

For Gemini AI quiz generation and other server-side features:

1. Upgrade to Blaze plan (pay-as-you-go)
2. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

3. Initialize Cloud Functions:
```bash
firebase init functions
```

4. Deploy functions:
```bash
firebase deploy --only functions
```

## 12. Production Checklist

Before deploying to production:

- [ ] Update Firestore rules to production mode
- [ ] Update Storage rules to production mode
- [ ] Enable email verification
- [ ] Set up password recovery
- [ ] Configure CORS for your domain
- [ ] Set up monitoring and analytics
- [ ] Enable security features (App Check)
- [ ] Set up budget alerts

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid)"
- Check your API key in Firebase config
- Regenerate API key if needed

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated
- Verify user has correct role

### Error: "Firebase app named '[DEFAULT]' already exists"
- Remove duplicate Firebase initialization
- Only initialize once in `src/firebase/config.js`

### Collections not appearing
- Check Firestore rules
- Verify authentication is working
- Check browser console for errors

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)

---

**Next Steps**: After completing this configuration, refer to `SETUP_GUIDE.md` to run the application.

