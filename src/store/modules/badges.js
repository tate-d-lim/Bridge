import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  where,
  updateDoc,
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'

// Badge Definitions
const BADGE_DEFINITIONS = {
  // Performance-Based Badges (based on wins)
  performance: [
    {
      id: 'bronze_performer',
      name: 'Bronze Performer',
      description: 'Achieve your first quiz win',
      icon: '🥉',
      tier: 'bronze',
      requirement: 1,
      type: 'wins'
    },
    {
      id: 'silver_performer',
      name: 'Silver Performer',
      description: 'Win 5 quizzes',
      icon: '🥈',
      tier: 'silver',
      requirement: 5,
      type: 'wins'
    },
    {
      id: 'gold_performer',
      name: 'Gold Performer',
      description: 'Win 10 quizzes',
      icon: 'trophy',
      iconType: 'svg',
      tier: 'gold',
      requirement: 10,
      type: 'wins'
    },
    {
      id: 'platinum_performer',
      name: 'Platinum Performer',
      description: 'Win 25 quizzes',
      icon: 'gem',
      iconType: 'svg',
      tier: 'platinum',
      requirement: 25,
      type: 'wins'
    }
  ],
  
  // Participation-Based Badges (based on total quizzes)
  participation: [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Complete 10 quizzes',
      icon: '📚',
      tier: 'bronze',
      requirement: 10,
      type: 'plays'
    },
    {
      id: 'learner',
      name: 'Dedicated Learner',
      description: 'Complete 20 quizzes',
      icon: '📖',
      tier: 'silver',
      requirement: 20,
      type: 'plays'
    },
    {
      id: 'scholar',
      name: 'Scholar',
      description: 'Complete 30 quizzes',
      icon: '🎓',
      tier: 'gold',
      requirement: 30,
      type: 'plays'
    },
    {
      id: 'master',
      name: 'Quiz Master',
      description: 'Complete 40 quizzes',
      icon: '👨‍🎓',
      tier: 'platinum',
      requirement: 40,
      type: 'plays'
    }
  ],
  
  // Streak-Based Badges (consecutive days)
  streak: [
    {
      id: 'streak_3',
      name: 'Hot Streak',
      description: 'Play for 3 consecutive days',
      icon: '🔥',
      tier: 'bronze',
      requirement: 3,
      type: 'day_streak'
    },
    {
      id: 'streak_5',
      name: 'On Fire',
      description: 'Play for 5 consecutive days',
      icon: '🔥🔥',
      tier: 'silver',
      requirement: 5,
      type: 'day_streak'
    },
    {
      id: 'streak_7',
      name: 'Unstoppable',
      description: 'Play for 7 consecutive days',
      icon: '🔥🔥🔥',
      tier: 'gold',
      requirement: 7,
      type: 'day_streak'
    },
    {
      id: 'streak_14',
      name: 'Legendary',
      description: 'Play for 14 consecutive days',
      icon: '⚡',
      tier: 'platinum',
      requirement: 14,
      type: 'day_streak'
    }
  ],
  
  // Win Streak Badges (consecutive wins)
  winStreak: [
    {
      id: 'win_streak_3',
      name: 'Triple Threat',
      description: 'Win 3 quizzes in a row',
      icon: '⭐',
      tier: 'bronze',
      requirement: 3,
      type: 'win_streak'
    },
    {
      id: 'win_streak_5',
      name: 'Dominator',
      description: 'Win 5 quizzes in a row',
      icon: '⭐⭐',
      tier: 'silver',
      requirement: 5,
      type: 'win_streak'
    },
    {
      id: 'win_streak_10',
      name: 'Champion',
      description: 'Win 10 quizzes in a row',
      icon: '🏆',
      tier: 'gold',
      requirement: 10,
      type: 'win_streak'
    }
  ],
  
  // Perfect Score Badges
  perfect: [
    {
      id: 'first_perfect',
      name: 'Perfect!',
      description: 'Get your first 100% score',
      icon: '💯',
      tier: 'gold',
      requirement: 1,
      type: 'perfect_scores'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 5 perfect scores',
      icon: '✨',
      tier: 'platinum',
      requirement: 5,
      type: 'perfect_scores'
    }
  ]
}

export default {
  namespaced: true,
  
  state: {
    userStats: null,
    earnedBadges: [],
    allBadges: [],
    newlyEarnedBadges: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_USER_STATS(state, stats) {
      state.userStats = stats
    },
    SET_EARNED_BADGES(state, badges) {
      state.earnedBadges = badges
    },
    SET_ALL_BADGES(state, badges) {
      state.allBadges = badges
    },
    ADD_NEWLY_EARNED_BADGE(state, badge) {
      state.newlyEarnedBadges.push(badge)
    },
    CLEAR_NEWLY_EARNED_BADGES(state) {
      state.newlyEarnedBadges = []
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    // Initialize user stats when they first start taking quizzes
    async initializeUserStats({ commit }, userId) {
      try {
        const statsRef = doc(db, 'userStats', userId)
        const statsDoc = await getDoc(statsRef)
        
        if (!statsDoc.exists()) {
          const initialStats = {
            userId,
            totalPlays: 0,
            totalWins: 0,
            winPercentage: 0,
            bestScore: 0,
            currentDayStreak: 0,
            maxDayStreak: 0,
            currentWinStreak: 0,
            maxWinStreak: 0,
            perfectScores: 0,
            lastPlayedDate: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          await setDoc(statsRef, initialStats)
          commit('SET_USER_STATS', initialStats)
          return initialStats
        } else {
          const stats = statsDoc.data()
          commit('SET_USER_STATS', stats)
          return stats
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Update user stats after completing a quiz
    async updateUserStats({ commit, dispatch }, { userId, score, isPerfect = false }) {
      console.log('📊 Updating user stats:', { userId, score, isPerfect })
      try {
        const statsRef = doc(db, 'userStats', userId)
        const statsDoc = await getDoc(statsRef)
        
        if (!statsDoc.exists()) {
          console.log('⚠️ User stats not found, initializing...')
          await dispatch('initializeUserStats', userId)
          return dispatch('updateUserStats', { userId, score, isPerfect })
        }
        
        const currentStats = statsDoc.data()
        const isWin = score >= 80 // Win threshold
        
        // Calculate day streak
        const today = new Date().toDateString()
        const lastPlayed = currentStats.lastPlayedDate ? 
          new Date(currentStats.lastPlayedDate).toDateString() : null
        
        let currentDayStreak = currentStats.currentDayStreak || 0
        let maxDayStreak = currentStats.maxDayStreak || 0
        
        if (lastPlayed) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toDateString()
          
          if (lastPlayed === yesterdayStr) {
            // Consecutive day
            currentDayStreak += 1
          } else if (lastPlayed !== today) {
            // Streak broken
            currentDayStreak = 1
          }
          // If played today already, don't increment
        } else {
          currentDayStreak = 1
        }
        
        maxDayStreak = Math.max(maxDayStreak, currentDayStreak)
        
        // Calculate win streak
        let currentWinStreak = currentStats.currentWinStreak || 0
        let maxWinStreak = currentStats.maxWinStreak || 0
        
        if (isWin) {
          currentWinStreak += 1
          maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
        } else {
          currentWinStreak = 0
        }
        
        // Calculate totals
        const totalPlays = (currentStats.totalPlays || 0) + 1
        const totalWins = (currentStats.totalWins || 0) + (isWin ? 1 : 0)
        const winPercentage = Math.round((totalWins / totalPlays) * 100)
        const bestScore = Math.max(currentStats.bestScore || 0, score)
        const perfectScores = (currentStats.perfectScores || 0) + (isPerfect ? 1 : 0)
        
        const updatedStats = {
          ...currentStats,
          totalPlays,
          totalWins,
          winPercentage,
          bestScore,
          currentDayStreak,
          maxDayStreak,
          currentWinStreak,
          maxWinStreak,
          perfectScores,
          lastPlayedDate: new Date().toISOString(),
          updatedAt: serverTimestamp()
        }
        
        await updateDoc(statsRef, updatedStats)
        commit('SET_USER_STATS', updatedStats)
        
        console.log('✅ User stats updated:', {
          totalPlays: updatedStats.totalPlays,
          totalWins: updatedStats.totalWins,
          currentDayStreak: updatedStats.currentDayStreak,
          currentWinStreak: updatedStats.currentWinStreak,
          perfectScores: updatedStats.perfectScores
        })
        
        // Check for new badges
        await dispatch('checkAndAwardBadges', { userId, stats: updatedStats })
        
        return updatedStats
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Check if user has earned any new badges
    async checkAndAwardBadges({ commit, state }, { userId, stats }) {
      console.log('🏆 Checking for new badges...')
      try {
        const allBadgeTypes = [
          ...BADGE_DEFINITIONS.performance,
          ...BADGE_DEFINITIONS.participation,
          ...BADGE_DEFINITIONS.streak,
          ...BADGE_DEFINITIONS.winStreak,
          ...BADGE_DEFINITIONS.perfect
        ]
        
        // Fetch currently earned badges
        const earnedQuery = query(
          collection(db, 'earnedBadges'),
          where('userId', '==', userId)
        )
        const earnedSnapshot = await getDocs(earnedQuery)
        const earnedBadgeIds = earnedSnapshot.docs.map(doc => doc.data().badgeId)
        
        console.log('Already earned badges:', earnedBadgeIds)
        
        const newlyEarned = []
        
        // Check each badge type
        for (const badge of allBadgeTypes) {
          // Skip if already earned
          if (earnedBadgeIds.includes(badge.id)) continue
          
          let shouldAward = false
          
          switch (badge.type) {
            case 'wins':
              shouldAward = stats.totalWins >= badge.requirement
              break
            case 'plays':
              shouldAward = stats.totalPlays >= badge.requirement
              break
            case 'day_streak':
              shouldAward = stats.maxDayStreak >= badge.requirement
              break
            case 'win_streak':
              shouldAward = stats.maxWinStreak >= badge.requirement
              break
            case 'perfect_scores':
              shouldAward = stats.perfectScores >= badge.requirement
              break
          }
          
          if (shouldAward) {
            console.log(`🎉 NEW BADGE EARNED: ${badge.name} (${badge.id})`)
            
            // Award the badge
            await addDoc(collection(db, 'earnedBadges'), {
              userId,
              badgeId: badge.id,
              badgeName: badge.name,
              badgeIcon: badge.icon,
              badgeTier: badge.tier,
              badgeDescription: badge.description,
              earnedAt: serverTimestamp()
            })
            
            newlyEarned.push(badge)
            commit('ADD_NEWLY_EARNED_BADGE', badge)
          }
        }
        
        if (newlyEarned.length > 0) {
          console.log(`✨ Total new badges earned: ${newlyEarned.length}`, newlyEarned.map(b => b.name))
        } else {
          console.log('No new badges earned this time')
        }
        
        return newlyEarned
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Fetch all user's earned badges
    async fetchEarnedBadges({ commit }, userId) {
      try {
        console.log('🔍 Fetching earned badges for user:', userId)
        
        // Try with orderBy first
        try {
          const q = query(
            collection(db, 'earnedBadges'),
            where('userId', '==', userId),
            orderBy('earnedAt', 'desc')
          )
          const snapshot = await getDocs(q)
          console.log('📊 Found', snapshot.size, 'earned badges')
          const badges = snapshot.docs.map(doc => {
            const data = doc.data()
            console.log('   Badge:', data)
            return {
              id: doc.id,
              ...data
            }
          })
          
          console.log('📜 Earned badges array:', badges)
          commit('SET_EARNED_BADGES', badges)
          return badges
        } catch (orderByError) {
          console.warn('⚠️ OrderBy query failed, trying without orderBy:', orderByError.message)
          // Fallback: query without orderBy
          const q = query(
            collection(db, 'earnedBadges'),
            where('userId', '==', userId)
          )
          const snapshot = await getDocs(q)
          console.log('📊 Found', snapshot.size, 'earned badges (no orderBy)')
          const badges = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          // Sort manually by earnedAt
          badges.sort((a, b) => {
            const dateA = a.earnedAt?.seconds || 0
            const dateB = b.earnedAt?.seconds || 0
            return dateB - dateA
          })
          
          console.log('📜 Earned badges (sorted manually):', badges)
          commit('SET_EARNED_BADGES', badges)
          return badges
        }
      } catch (error) {
        console.error('Error fetching earned badges:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        commit('SET_ERROR', error.message)
        // Return empty array instead of throwing
        commit('SET_EARNED_BADGES', [])
        return []
      }
    },
    
    // Get all available badges with earned status
    async getAllBadgesWithStatus({ commit }, userId) {
      try {
        const earnedQuery = query(
          collection(db, 'earnedBadges'),
          where('userId', '==', userId)
        )
        const earnedSnapshot = await getDocs(earnedQuery)
        const earnedBadgeIds = earnedSnapshot.docs.map(doc => doc.data().badgeId)
        
        const allBadges = {
          performance: BADGE_DEFINITIONS.performance.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id)
          })),
          participation: BADGE_DEFINITIONS.participation.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id)
          })),
          streak: BADGE_DEFINITIONS.streak.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id)
          })),
          winStreak: BADGE_DEFINITIONS.winStreak.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id)
          })),
          perfect: BADGE_DEFINITIONS.perfect.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id)
          }))
        }
        
        commit('SET_ALL_BADGES', allBadges)
        return allBadges
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    clearNewlyEarnedBadges({ commit }) {
      commit('CLEAR_NEWLY_EARNED_BADGES')
    }
  },
  
  getters: {
    userStats: state => state.userStats,
    earnedBadges: state => state.earnedBadges,
    allBadges: state => state.allBadges,
    newlyEarnedBadges: state => state.newlyEarnedBadges,
    hasNewBadges: state => state.newlyEarnedBadges.length > 0,
    earnedBadgeCount: state => state.earnedBadges.length,
    totalBadgeCount: state => {
      return Object.values(BADGE_DEFINITIONS).reduce((sum, category) => sum + category.length, 0)
    },
    badgeProgress: state => {
      const total = Object.values(BADGE_DEFINITIONS).reduce((sum, category) => sum + category.length, 0)
      const earned = state.earnedBadges.length
      return total > 0 ? Math.round((earned / total) * 100) : 0
    }
  }
}

