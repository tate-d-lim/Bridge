# 🐛 Debugging the Badges System

## Steps to Debug:

### 1. Open Browser Console
Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools

### 2. Complete a Quiz
Go to `/quizzes/:id` and complete a quiz

### 3. Watch the Console Logs

You should see logs like this:

```
Submitting quiz result: { userId: "...", score: 85, isPerfect: false, isWin: true }
📊 Updating user stats: { userId: "...", score: 85, isPerfect: false }
✅ User stats updated: { totalPlays: 1, totalWins: 1, ... }
🏆 Checking for new badges...
Already earned badges: []
🎉 NEW BADGE EARNED: Bronze Performer (bronze_performer)
✨ Total new badges earned: 1 ["Bronze Performer"]
Quiz submitted successfully! Check for badge notifications.
🎉 New badges earned: [{ id: "bronze_performer", ... }]
```

### 4. Common Issues & Solutions:

#### Issue: "No user logged in"
**Solution:** Make sure you're logged in as a job seeker

#### Issue: Firebase errors (permission denied)
**Solution:** Check Firebase security rules. You need:
```javascript
match /userStats/{userId} {
  allow read, write: if request.auth.uid == userId;
}
match /earnedBadges/{badgeId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.userId;
}
match /quizResults/{resultId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.userId;
}
```

#### Issue: "User stats not found, initializing..."
**Solution:** This is normal for first-time users. The system will create stats automatically.

#### Issue: No badges earned
**Solution:** Check badge requirements:
- First quiz win (score ≥ 80%) = Bronze Performer badge
- First 100% score = Perfect! badge
- Complete 10 quizzes = Beginner badge

### 5. Manual Testing:

1. **Test First Win:**
   - Take a quiz
   - Score ≥ 80%
   - Should earn "Bronze Performer" 🥉

2. **Test Perfect Score:**
   - Get 100% on any quiz
   - Should earn "Perfect!" 💯

3. **Test Participation:**
   - Complete 10 quizzes (any score)
   - Should earn "Beginner" 📚

4. **Check Achievements Page:**
   - Go to `/achievements`
   - Should see updated stats
   - Progress bars should reflect your progress

5. **Check Profile:**
   - Go to `/profile`
   - Scroll to "Badges & Achievements"
   - Should see earned badges

### 6. Console Commands for Testing:

Open browser console and try:

```javascript
// Check if badges module is loaded
$store.state.badges

// Check current user stats
$store.getters['badges/userStats']

// Check earned badges
$store.getters['badges/earnedBadges']

// Check newly earned badges (for notification)
$store.getters['badges/newlyEarnedBadges']
```

### 7. Check Network Tab:

In DevTools > Network tab:
- Look for Firestore requests
- Check for any failed requests (red)
- Verify data is being written to Firebase

### 8. Firebase Console:

Go to Firebase Console and check:
1. **Firestore Database** > Collections:
   - `userStats` - Should have your userId
   - `earnedBadges` - Should have badge documents
   - `quizResults` - Should have quiz results

2. **Authentication** > Users:
   - Verify you're logged in
   - Check your userId matches

---

## Expected First Quiz Behavior:

After completing your FIRST quiz with score ≥ 80%:

✅ Console logs show stats update  
✅ Badge notification popup appears  
✅ "Bronze Performer" badge is earned  
✅ Profile shows 1 badge  
✅ Achievements page shows progress  

---

## If Nothing Works:

1. Clear browser cache and reload
2. Check if Firebase is configured correctly
3. Verify you're on the latest code (refresh if dev server was running)
4. Check for JavaScript errors in console
5. Try in incognito mode

---

## Need More Help?

Share these details:
- Browser console output
- Any error messages
- Screenshot of Network tab
- Your Firebase security rules

