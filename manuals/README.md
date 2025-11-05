# Bridge - Job Matching Platform

Bridge is a comprehensive web application that connects Singapore employers with skilled migrant workers, eliminating the need for expensive middlemen agencies. The platform features AI-powered job matching, skill development through quizzes, real-time chat, and a robust review system.

## 🌟 Features

### Core Functionality
- **Job Listing**: Browse and post job opportunities
- **User Authentication**: Secure Firebase-based authentication
- **AI-Powered Quizzes**: Gemini AI-generated skill assessments with badges
- **Real-time Chat**: Direct communication between employers and job seekers
- **Review System**: Employer reviews and testimonials
- **Mobile Responsive**: Works seamlessly on all devices

### For Job Seekers (Migrant Workers)
- Create detailed profiles with skills and experience
- Browse job listings with advanced filters
- Apply for jobs with cover letters and resumes
- Take AI-generated quizzes to upskill and earn badges
- Chat directly with employers
- View and manage job applications

### For Employers
- Post job listings with detailed requirements
- Browse and search for qualified candidates
- Manage job applications and hiring process
- Review and rate job seekers
- Chat with potential candidates
- Access employer dashboard with analytics

## 🛠 Technology Stack

### Frontend
- **Vue.js 3** with Composition API
- **Vuex** for state management
- **Vue Router** for navigation
- **Axios** for API calls
- **Firebase** for client-side authentication

### Backend
- **Node.js** (to be implemented)
- **Firebase Firestore** for database
- **Firebase Admin SDK** for authentication
- **Gemini AI** for quiz generation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Firebase account
- A Google Cloud account (for Gemini AI - optional)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Bridge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage (optional)

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click on the Web app icon (</>)
   - Copy the configuration object

### 4. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Update `src/firebase/config.js` with your Firebase configuration

### 5. Firestore Database Setup

Create the following collections in Firestore:

1. **users** - User profiles
```javascript
{
  name: string,
  email: string,
  phone: string,
  role: "jobseeker" | "employer",
  // For job seekers:
  skills: array,
  experience: number,
  // For employers:
  company: string,
  industry: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

2. **jobs** - Job listings
```javascript
{
  title: string,
  company: string,
  category: string,
  type: string,
  location: string,
  salary: number,
  description: string,
  requirements: array,
  benefits: array,
  employerId: string,
  status: "active" | "closed",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

3. **applications** - Job applications
```javascript
{
  jobId: string,
  userId: string,
  coverLetter: string,
  resume: string,
  status: "pending" | "accepted" | "rejected",
  createdAt: timestamp
}
```

4. **chats** - Chat conversations
```javascript
{
  participants: array,
  jobId: string (optional),
  lastMessage: string,
  lastMessageAt: timestamp,
  createdAt: timestamp
}
```

5. **quizzes** - Quiz data
```javascript
{
  skill: string,
  difficulty: string,
  questions: array,
  createdAt: timestamp
}
```

6. **badges** - User badges
```javascript
{
  userId: string,
  skill: string,
  level: string,
  earnedAt: timestamp
}
```

### 6. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
Bridge/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, logos
│   ├── components/        # Reusable Vue components
│   │   ├── NavBar.vue
│   │   └── JobCard.vue
│   ├── views/             # Page components
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── JobListings.vue
│   │   ├── JobDetails.vue
│   │   ├── JobSeekerDashboard.vue
│   │   ├── EmployerDashboard.vue
│   │   ├── Profile.vue
│   │   ├── PostJob.vue
│   │   ├── Chat.vue
│   │   ├── Quizzes.vue
│   │   ├── QuizTake.vue
│   │   ├── Applications.vue
│   │   └── Candidates.vue
│   ├── router/            # Vue Router configuration
│   │   └── index.js
│   ├── store/             # Vuex store
│   │   ├── index.js
│   │   └── modules/
│   │       ├── auth.js
│   │       ├── jobs.js
│   │       ├── chat.js
│   │       ├── quizzes.js
│   │       └── applications.js
│   ├── firebase/          # Firebase configuration
│   │   └── config.js
│   ├── App.vue            # Root component
│   ├── main.js            # Application entry point
│   └── style.css          # Global styles
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## 🔑 Key Features Implementation

### Authentication Flow
1. User registers as either Job Seeker or Employer
2. Firebase Authentication creates user account
3. User profile stored in Firestore
4. Role-based routing and access control

### Job Posting Flow
1. Employer creates job listing
2. Job stored in Firestore with employer ID
3. Job appears in job listings
4. Job seekers can search and filter jobs

### Application Flow
1. Job seeker views job details
2. Submits application with cover letter
3. Application stored in Firestore
4. Employer can view and manage applications

### Quiz System
1. Job seeker selects a quiz topic
2. Quiz questions generated (or retrieved from Firestore)
3. User answers questions
4. Score calculated and badge awarded if passed

### Chat System
1. Initiate chat from job application or profile
2. Real-time messages using Firestore listeners
3. Message history stored per conversation

## 🔐 Security Rules

Add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Jobs collection
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.employerId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.employerId == request.auth.uid;
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.participants;
    }
  }
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 📝 TODO / Future Enhancements

- [ ] Implement Gemini AI quiz generation API
- [ ] Add video interview feature
- [ ] Implement advanced search with Algolia
- [ ] Add email notifications
- [ ] Implement payment system for premium features
- [ ] Add job recommendation algorithm
- [ ] Implement skills verification system
- [ ] Add multi-language support
- [ ] Create mobile app with React Native

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Firebase for backend services
- Google for Gemini AI
- All contributors and testers

## 📞 Support

For support, email support@bridge.com or join our Slack channel.

---

**Note**: Remember to never commit your `.env` file or expose your Firebase credentials publicly!
