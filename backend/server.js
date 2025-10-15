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
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "..", "firebase_private_key.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
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
