# Spelling Quizzes - Firestore Viewing Guide

## Where Spelling Quizzes Are Stored

Spelling quizzes are stored in Firebase Firestore under the **`spellingQuizzes`** collection.

## How to View Spelling Quizzes in Firestore Console

### Step 1: Access Firestore
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Firestore Database** (or Firebase Console → Firestore)
3. Select your project: **match-789c3** (or your project name)

### Step 2: View the Collection
1. In the left sidebar, look for **`spellingQuizzes`** collection
2. Click on it to view all stored spelling quizzes
3. Each document represents one complete spelling quiz session

### Step 3: Understanding Document Structure

Each spelling quiz document contains:

```javascript
{
  skill: "construction",           // String: The skill category
  difficulty: "Beginner",          // String: Difficulty level (Beginner/Intermediate/Advanced)
  words: [                         // Array: List of words in the quiz
    {
      word: "SAFETY",              // String: The word to spell
      hint: "Protection from danger", // String: Hint for the word
      letters: ["S","A","F","E","T","Y"], // Array: Individual letters
      distractors: ["X","Y","Z"],  // Array: Extra letters (not in word)
      image: null                   // String|null: Optional image path
    },
    // ... more words
  ],
  numberOfWords: 5,                // Number: Total words in quiz
  createdAt: Timestamp            // Timestamp: When quiz was created
}
```

### Step 4: View Individual Quiz Details

1. Click on any document ID (e.g., `abc123xyz`)
2. The right panel will show all fields and their values
3. Expand the `words` array to see individual word objects
4. Each word shows:
   - `word`: The spelling word
   - `hint`: The hint provided to users
   - `letters`: Array of letters in the word
   - `distractors`: Extra letters for the letter pool

## Querying Spelling Quizzes

### Filter by Difficulty
1. Click on the filter icon (funnel) above the documents list
2. Select field: `difficulty`
3. Choose operator: `==`
4. Enter value: `Beginner` (or `Intermediate`, `Advanced`)
5. Click **Apply**

### Filter by Skill
1. Use the filter to select field: `skill`
2. Choose operator: `==`
3. Enter value: `construction`
4. Click **Apply**

### Sort by Creation Date
1. Click on the sort icon above the documents
2. Select field: `createdAt`
3. Choose order: **Descending** (newest first) or **Ascending** (oldest first)

## API Endpoints for Spelling Quizzes

### Backend Endpoints (Node.js)
- **Generate one word**: `POST /api/construction-spelling/generate`
- **Generate/save full quiz**: `POST /api/spelling-quiz/generate`
- **Get all quizzes**: `GET /api/spelling-quizzes`
- **Get quiz by ID**: `GET /api/spelling-quizzes/:id`

### Frontend Usage
```javascript
import { quizApi } from '../services/api'

// Generate one construction spelling word
const response = await quizApi.generateConstructionSpellingWord({ difficulty: 'Beginner' })

// Generate and save full quiz
const quizResponse = await quizApi.generateSpellingQuiz({
  skill: 'construction',
  difficulty: 'Beginner',
  numberOfWords: 5,
  words: generatedWordsArray // optional - if provided, uses these instead of generating
})

// Get all spelling quizzes
const quizzes = await quizApi.getSpellingQuizzes()

// Get specific quiz
const quiz = await quizApi.getSpellingQuizById(quizId)
```

## Collection Path in Firestore

```
/databases/(default)/documents/spellingQuizzes/{quizId}
```

## Notes

- Spelling quizzes are automatically saved when users take a quiz
- Each quiz session generates a new document
- Words are AI-generated using Google Gemini
- The collection grows as more users take spelling quizzes
- Old quizzes are not automatically deleted (you may want to add cleanup logic)

## Troubleshooting

### If `spellingQuizzes` collection doesn't appear:
1. Make sure someone has taken at least one spelling quiz
2. Check that the backend server is running
3. Verify Firestore rules allow writes to `spellingQuizzes`
4. Check browser console for any errors during quiz generation

### Viewing Large Collections:
- Use pagination controls at the bottom
- Apply filters to narrow down results
- Use the search bar if available

