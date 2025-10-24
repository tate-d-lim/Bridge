# 🏆 Badges System Documentation

## Overview

The Badges System is a comprehensive gamification feature designed to enhance user engagement and encourage continued learning through quiz activities. Users can earn badges by completing quizzes, achieving high scores, and maintaining learning streaks.

## Features

### 1. Badge Categories

#### 🥇 Performance Badges
Earned by achieving quiz wins (score ≥ 80%)

- **Bronze Performer** 🥉 - 1 win
- **Silver Performer** 🥈 - 5 wins  
- **Gold Performer** 🥇 - 10 wins
- **Platinum Performer** 💎 - 25 wins

#### 📚 Participation Badges
Unlocked by completing quizzes (regardless of score)

- **Beginner** 📚 - 10 quizzes completed
- **Dedicated Learner** 📖 - 20 quizzes completed
- **Scholar** 🎓 - 30 quizzes completed
- **Quiz Master** 👨‍🎓 - 40 quizzes completed

#### 🔥 Day Streak Badges
Maintain consecutive days of play

- **Hot Streak** 🔥 - 3 consecutive days
- **On Fire** 🔥🔥 - 5 consecutive days
- **Unstoppable** 🔥🔥🔥 - 7 consecutive days
- **Legendary** ⚡ - 14 consecutive days

#### ⭐ Win Streak Badges
Win multiple quizzes in a row

- **Triple Threat** ⭐ - 3 consecutive wins
- **Dominator** ⭐⭐ - 5 consecutive wins
- **Champion** 🏆 - 10 consecutive wins

#### 💯 Perfect Score Badges
Achieve 100% quiz scores

- **Perfect!** 💯 - First 100% score
- **Perfectionist** ✨ - 5 perfect scores

---

## Architecture

### File Structure

```
src/
├── store/modules/
│   └── badges.js              # Badge state management, logic, and Firebase integration
├── components/
│   └── BadgeNotification.vue  # Popup notification when badges are earned
├── views/
│   ├── Achievements.vue       # Full achievements page with all badges
│   └── Profile.vue            # Updated to show earned badges
```

### Database Collections

#### `userStats` Collection
Tracks individual user statistics:
```javascript
{
  userId: string,
  totalPlays: number,
  totalWins: number,
  winPercentage: number,
  bestScore: number,
  currentDayStreak: number,
  maxDayStreak: number,
  currentWinStreak: number,
  maxWinStreak: number,
  perfectScores: number,
  lastPlayedDate: string (ISO),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `earnedBadges` Collection
Stores earned badges per user:
```javascript
{
  userId: string,
  badgeId: string,
  badgeName: string,
  badgeIcon: string,
  badgeTier: string, // bronze, silver, gold, platinum
  badgeDescription: string,
  earnedAt: timestamp
}
```

#### `quizResults` Collection
Stores quiz completion data:
```javascript
{
  userId: string,
  quizId: string,
  score: number,
  answers: array,
  completedAt: string (ISO)
}
```

---

## How It Works

### 1. Quiz Completion Flow

```mermaid
User completes quiz
    ↓
submitQuizResult (quizzes store)
    ↓
updateUserStats (badges store)
    ↓
Calculate new stats (wins, streaks, etc.)
    ↓
checkAndAwardBadges
    ↓
Compare stats against badge requirements
    ↓
Award new badges to Firebase
    ↓
Display BadgeNotification popup
```

### 2. Streak Tracking

#### Day Streak Logic
- Increments when user plays on consecutive days
- Resets if a day is skipped
- `lastPlayedDate` is compared with current date
- `maxDayStreak` stores the longest streak achieved

#### Win Streak Logic
- Increments on each win (score ≥ 80%)
- Resets to 0 on any loss
- `maxWinStreak` tracks the best streak

### 3. Badge Evaluation

After each quiz:
1. User stats are updated in `userStats` collection
2. System fetches all earned badges for the user
3. For each badge definition:
   - Check if already earned (skip if yes)
   - Compare current stat to requirement
   - Award badge if threshold reached
4. Newly earned badges are stored in state
5. BadgeNotification component displays popup

---

## Components

### BadgeNotification.vue

**Purpose:** Displays a celebratory popup when badges are earned

**Features:**
- Animated confetti effect
- Shows all newly earned badges
- Action buttons to view all achievements or continue
- Auto-displays when badges are earned
- Watches Vuex state for new badges

**Usage:**
```vue
<BadgeNotification />
```
Add to `App.vue` for global display.

### Achievements.vue

**Purpose:** Full-page view of all badges and user statistics

**Features:**
- User stats dashboard (plays, wins, win rate, streaks)
- Progress bar showing overall badge completion
- All badge categories with locked/unlocked states
- Progress indicators for each badge
- Visual feedback for earned badges

**Route:** `/achievements`

**Access:** Job seekers only

---

## Vuex Store

### State
```javascript
{
  userStats: object | null,        // Current user statistics
  earnedBadges: array,              // List of earned badges
  allBadges: object,                // All badge definitions with earned status
  newlyEarnedBadges: array,         // Badges just earned (for notification)
  loading: boolean,
  error: string | null
}
```

### Actions

#### `initializeUserStats(userId)`
Creates initial stats document for new users.

#### `updateUserStats({ userId, score, isPerfect })`
Updates user statistics after quiz completion and triggers badge evaluation.

**Parameters:**
- `userId`: User ID
- `score`: Quiz score (0-100)
- `isPerfect`: Boolean indicating 100% score

#### `checkAndAwardBadges({ userId, stats })`
Evaluates all badge requirements and awards new badges.

#### `fetchEarnedBadges(userId)`
Retrieves all earned badges for a user from Firebase.

#### `getAllBadgesWithStatus(userId)`
Returns all badge definitions with earned/locked status.

#### `clearNewlyEarnedBadges()`
Clears the notification queue after display.

### Getters
- `userStats` - Current user statistics
- `earnedBadges` - Array of earned badges
- `allBadges` - All badges with status
- `newlyEarnedBadges` - Recently earned (for notification)
- `hasNewBadges` - Boolean if new badges exist
- `earnedBadgeCount` - Total earned
- `totalBadgeCount` - Total available
- `badgeProgress` - Percentage of badges earned

---

## Integration Guide

### 1. Submit Quiz Results

In your quiz completion handler:

```javascript
await store.dispatch('quizzes/submitQuizResult', {
  userId: user.uid,
  quizId: 'quiz-id',
  score: 85,
  answers: [1, 2, 0, 3],
  isPerfect: score === 100
})
```

The badges system automatically:
- Updates user stats
- Checks for new badges
- Triggers notifications

### 2. Display User Badges

```vue
<template>
  <div v-for="badge in earnedBadges" :key="badge.id">
    <div class="badge-icon">{{ badge.badgeIcon }}</div>
    <h3>{{ badge.badgeName }}</h3>
    <p>{{ badge.badgeDescription }}</p>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()
    const earnedBadges = computed(() => store.getters['badges/earnedBadges'])
    
    onMounted(async () => {
      const user = store.getters['auth/currentUser']
      await store.dispatch('badges/fetchEarnedBadges', user.uid)
    })
    
    return { earnedBadges }
  }
}
</script>
```

### 3. Show User Statistics

```vue
<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()
    const stats = computed(() => store.getters['badges/userStats'])
    
    onMounted(async () => {
      const user = store.getters['auth/currentUser']
      await store.dispatch('badges/initializeUserStats', user.uid)
    })
    
    return { stats }
  }
}
</script>

<template>
  <div>
    <p>Total Plays: {{ stats?.totalPlays }}</p>
    <p>Wins: {{ stats?.totalWins }}</p>
    <p>Win Rate: {{ stats?.winPercentage }}%</p>
    <p>Best Score: {{ stats?.bestScore }}%</p>
    <p>Current Streak: {{ stats?.currentDayStreak }} days</p>
  </div>
</template>
```

---

## Styling

### Badge Tiers

The system uses gradient backgrounds for different badge tiers:

```css
/* Bronze */
.tier-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
}

/* Silver */
.tier-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
}

/* Gold */
.tier-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

/* Platinum */
.tier-platinum {
  background: linear-gradient(135deg, #e5e4e2 0%, #b0c4de 100%);
}
```

---

## Testing

### Test Scenarios

1. **First Quiz Completion**
   - User should earn "Bronze Performer" badge
   - "Beginner" badge progress should show 1/10

2. **Consecutive Days**
   - Play quiz today, tomorrow, day after
   - Should earn "Hot Streak" badge after 3 days

3. **Perfect Score**
   - Get 100% on a quiz
   - Should earn "Perfect!" badge

4. **Win Streak**
   - Win 3 quizzes in a row (score ≥ 80%)
   - Should earn "Triple Threat" badge

5. **Multiple Badges**
   - When earning multiple badges at once
   - All should display in the notification

---

## Firebase Security Rules

Add these rules to your Firestore:

```javascript
// User Stats
match /userStats/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}

// Earned Badges
match /earnedBadges/{badgeId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if false; // Badges can't be modified or removed
}

// Quiz Results
match /quizResults/{resultId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if false;
}
```

---

## Future Enhancements

### Potential Features
1. **Social Sharing** - Share badge achievements on social media
2. **Badge Leaderboard** - Compare badge counts with other users
3. **Seasonal Badges** - Limited-time badges for special events
4. **Skill-Specific Badges** - Badges for mastering specific quiz topics
5. **Challenge Badges** - Complete specific quiz challenges
6. **Collaborative Badges** - Team achievements
7. **Badge Rewards** - Unlock profile themes or avatars with badges
8. **Push Notifications** - Remind users to maintain streaks

### Planned Improvements
- Badge rarity system (common, rare, epic, legendary)
- Animated badge unlocks with sound effects
- Badge showcase on public profile
- Achievement hints for locked badges
- Badge search and filtering

---

## Troubleshooting

### Badges Not Awarding

1. Check if `submitQuizResult` is being called with `isPerfect` parameter
2. Verify user is authenticated
3. Check Firebase console for `userStats` document
4. Ensure badge requirements are being met
5. Check browser console for errors

### Stats Not Updating

1. Verify Firebase Firestore rules allow write access
2. Check if `updateUserStats` action is dispatching correctly
3. Ensure user ID is valid
4. Check for timestamp/date comparison issues

### Notification Not Showing

1. Ensure `BadgeNotification` component is in `App.vue`
2. Check if `newlyEarnedBadges` state is being populated
3. Verify Vuex state watcher is active
4. Check for z-index conflicts in CSS

---

## Performance Considerations

1. **Batch Operations** - Badge checks happen once per quiz, not per question
2. **Caching** - Earned badges are cached in Vuex state
3. **Selective Loading** - Only fetch badges when needed (profile, achievements page)
4. **Firestore Indexing** - Add composite indexes for common queries:
   - `earnedBadges`: (userId, earnedAt)
   - `userStats`: (userId)

---

## Credits

Badge system developed for the Bridge platform to enhance the quiz learning experience for migrant workers in Singapore.

**Version:** 1.0.0  
**Last Updated:** October 2025

---

## Support

For questions or issues with the badges system, please contact the development team or refer to the main project documentation.

