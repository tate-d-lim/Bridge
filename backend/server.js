// Backend Server for Bridge Application
// Handles Gemini AI requests and Firebase Admin operations

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// Prefer credentials from environment variables to avoid committing service account files
function getServiceAccountFromEnv() {
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY || "";
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    return {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: "googleapis.com",
    };
  }

  return null;
}

let serviceAccount = getServiceAccountFromEnv();

if (!serviceAccount) {
  // Fallback: read from file if present (local dev only). File is ignored by git.
  try {
    serviceAccount = JSON.parse(
      readFileSync(join(__dirname, "..", "firebase_private_key.json"), "utf8")
    );
  } catch (err) {
    console.error("Firebase Admin credentials not found in env and file read failed.");
    throw err;
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateQuizQuestions(numberOfQuestions, difficulty, skill) {
  const prompt = `Generate ${numberOfQuestions} multiple choice questions for a ${difficulty} level quiz about ${skill}. 

Format the response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Make the questions practical and relevant for job seekers in Singapore. The correctAnswer should be the index (0-3) of the correct option.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });


  const text = response.text;

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Gemini raw response:", text);
    throw new Error("Failed to parse quiz questions from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

async function generateSpellingWords(numberOfWords, difficulty, skill) {
  const prompt = `Generate ${numberOfWords} spelling words for a ${difficulty} level spelling quiz about ${skill}. 

Format the response as a JSON array with this structure:
[
  {
    "word": "WORD",
    "hint": "A helpful hint about the word",
    "letters": ["W", "O", "R", "D"]
  }
]

Make the words practical and relevant for job seekers in Singapore. The letters array should contain each letter of the word as separate strings.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Gemini raw response:", text);
    throw new Error("Failed to parse spelling words from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

async function generateConstructionSpellingWord(difficulty) {
  // Define word length based on difficulty
  let wordLengthRange;
  if (difficulty === 'beginner' || difficulty === 'Beginner') {
    wordLengthRange = "4-5 letters";
  } else if (difficulty === 'intermediate' || difficulty === 'Intermediate') {
    wordLengthRange = "6-8 letters";
  } else {
    wordLengthRange = "9 letters and above";
  }

  const prompt = `Generate ONE construction-themed spelling word for a ${difficulty} level spelling quiz. The word must be exactly ${wordLengthRange} long.

Format the response as a JSON object with this EXACT structure:
{
  "word": "WORD",
  "hint": "A helpful hint describing what this construction term means",
  "letters": ["W", "O", "R", "D"],
  "distractors": ["X", "Y", "Z", "A"]
}

Requirements:
- The word must be a construction-related term (e.g., tools, materials, techniques, safety equipment, building parts)
- The word length must match ${wordLengthRange}
- The letters array must contain ALL letters of the word as separate uppercase strings
- The distractors array must contain exactly 4 different uppercase letters that are NOT in the word
- The hint should be practical and helpful for someone learning construction terminology
- Make it suitable for construction workers in Singapore
- DO NOT RETURN REPEATED WORDS

Respond with ONLY valid JSON, no additional text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;

  // Try to extract JSON from the response
  let jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Gemini raw response:", text);
    throw new Error("Failed to parse construction spelling word from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Generate Quiz using Gemini AI
app.post("/api/quizzes/generate", async (req, res) => {
  try {
    const { skill, difficulty, numberOfQuestions = 10 } = req.body;

    if (!skill || !difficulty) {
      return res.status(400).json({ error: "Skill and difficulty are required" });
    }

    const questions = await generateQuizQuestions(numberOfQuestions, difficulty, skill);

    // Save quiz to Firestore
    const quizRef = await db.collection("quizzes").add({
      skill,
      difficulty,
      questions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      numberOfQuestions: questions.length,
    });

    res.json({
      success: true,
      quizId: quizRef.id,
      quiz: { id: quizRef.id, skill, difficulty, questions },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({
      error: "Failed to generate quiz",
      message: error.message,
    });
  }
});

// Generate Spelling Quiz using Gemini AI
app.post("/api/spelling-quiz/generate", async (req, res) => {
  try {
    const { skill, difficulty, numberOfWords = 5 } = req.body;

    if (!skill || !difficulty) {
      return res.status(400).json({ error: "Skill and difficulty are required" });
    }

    const words = await generateSpellingWords(numberOfWords, difficulty, skill);

    // Save spelling quiz to Firestore
    const quizRef = await db.collection("spellingQuizzes").add({
      skill,
      difficulty,
      words,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      numberOfWords: words.length,
    });

    res.json({
      success: true,
      quizId: quizRef.id,
      quiz: { id: quizRef.id, skill, difficulty, words },
    });
  } catch (error) {
    console.error("Error generating spelling quiz:", error);
    res.status(500).json({
      error: "Failed to generate spelling quiz",
      message: error.message,
    });
  }
});

// Generate Construction-themed Spelling Word
app.post("/api/construction-spelling/generate", async (req, res) => {
  try {
    const { difficulty } = req.body;

    if (!difficulty) {
      return res.status(400).json({ error: "Difficulty is required" });
    }

    const word = await generateConstructionSpellingWord(difficulty);

    res.json({
      success: true,
      word,
    });
  } catch (error) {
    console.error("Error generating construction spelling word:", error);
    res.status(500).json({
      error: "Failed to generate construction spelling word",
      message: error.message,
    });
  }
});

// Get all quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const snapshot = await db.collection("quizzes").get();
    const quizzes = [];
    snapshot.forEach((doc) => quizzes.push({ id: doc.id, ...doc.data() }));
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// Get quiz by ID
app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const doc = await db.collection("quizzes").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Quiz not found" });
    res.json({ success: true, quiz: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// Submit quiz result
app.post("/api/quizzes/results", async (req, res) => {
  try {
    const { userId, quizId, score, answers } = req.body;

    if (!userId || !quizId || score === undefined) {
      return res.status(400).json({ error: "userId, quizId, and score are required" });
    }

    const resultRef = await db.collection("quizResults").add({
      userId,
      quizId,
      score,
      answers,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Award badge if score >= 80%
    if (score >= 80) {
      const quizDoc = await db.collection("quizzes").doc(quizId).get();
      const quiz = quizDoc.data();

      await db.collection("badges").add({
        userId,
        skill: quiz.skill,
        level: quiz.difficulty,
        earnedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        resultId: resultRef.id,
        badgeEarned: true,
        badge: { skill: quiz.skill, level: quiz.difficulty },
      });
    } else {
      res.json({ success: true, resultId: resultRef.id, badgeEarned: false });
    }
  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({ error: "Failed to submit quiz result" });
  }
});

// Verify Firebase ID Token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Example protected route
app.get("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, profile: userDoc.data() });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
  console.log(`🤖 Gemini AI: Integrated successfully`);
});
