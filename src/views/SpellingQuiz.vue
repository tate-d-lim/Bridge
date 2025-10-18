<template>
  <div class="spelling-quiz-page">
    <div class="spelling-quiz-container">
      <div class="quiz-header">
        <h1>Spelling Challenge</h1>
        <div class="quiz-progress">
          <span>Word {{ currentWord + 1 }} of {{ words.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <p>Generating spelling words...</p>
      </div>

      <div v-else-if="!quizCompleted && currentWordData" class="spelling-game">
        <div class="word-display">
          <!-- Show hint instead of the word -->
          <div class="hint-section">
            <div v-if="currentWordData.image" class="hint-image">
              <img :src="currentWordData.image" :alt="currentWordData.hint" />
            </div>
            <div v-else class="hint-text">
              <h2>{{ currentWordData.hint }}</h2>
            </div>
          </div>
          
        </div>

        <div class="game-area">
          <!-- Drop zones for letters -->
          <div class="drop-zones">
            <div
              v-for="(slot, index) in letterSlots"
              :key="`slot-${index}`"
              :class="['drop-zone', { filled: slot.letter }]"
              :data-slot="index"
            >
              <span v-if="slot.letter" class="letter">{{ slot.letter }}</span>
            </div>
          </div>

          <!-- Draggable letters -->
          <div class="letter-pool">
            <div
              v-for="(letter, index) in availableLetters"
              :key="`letter-${index}`"
              :class="['draggable-letter', { used: letter.used }]"
              :data-letter="letter.char"
              :data-index="index"
              :data-letter-id="`${letter.char}-${index}`"
              @click="handleLetterClick"
            >
              {{ letter.char }}
            </div>
          </div>
        </div>

        <div class="game-actions">
          <button @click="checkAnswer" class="btn btn-primary" :disabled="!isWordComplete">
            Check Answer
          </button>
          <button @click="resetCurrentWord" class="btn btn-secondary">
            Reset
          </button>
        </div>
      </div>

      <div v-else-if="!currentWordData && !loading" class="empty-state">
        <p>No words available. Please try again.</p>
      </div>

      <div v-else class="quiz-results">
        <div class="results-card">
          <div class="score-circle">
            <h2>{{ score }}%</h2>
            <p>Your Score</p>
          </div>

          <h3>{{ score >= 80 ? '🎉 Excellent Spelling!' : 'Keep Practicing!' }}</h3>
          <p v-if="score >= 80">
            You've mastered the spelling challenge and earned a badge!
          </p>
          <p v-else>
            You need 80% or higher to earn a badge. Keep practicing!
          </p>

          <div class="results-actions">
            <router-link to="/quizzes" class="btn btn-secondary">
              Back to Quizzes
            </router-link>
            <button @click="retakeQuiz" class="btn btn-primary">
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'SpellingQuiz',
  setup() {
    const store = useStore()

    const currentWord = ref(0)
    const letterSlots = ref([])
    const availableLetters = ref([])
    const quizCompleted = ref(false)
    const score = ref(0)
    const correctAnswers = ref(0)

    const words = ref([])
    const loading = ref(false)

    const currentWordData = computed(() => words.value[currentWord.value] || null)
    const progress = computed(() => words.value.length > 0 ? ((currentWord.value + 1) / words.value.length) * 100 : 0)
    const isWordComplete = computed(() => letterSlots.value.every(slot => slot.letter))

    const initializeWord = () => {
      console.log('Initializing word:', currentWordData.value)
      const word = currentWordData.value
      if (!word) return
      
      letterSlots.value = word.letters.map(() => ({ letter: null, letterId: null }))
      
      // Create available letters with some extra letters for confusion
      const extraLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      
      // Get unique letters from the word to avoid duplicates
      const uniqueWordLetters = [...new Set(word.letters)]
      const shuffled = [...word.letters, ...extraLetters.filter(l => !uniqueWordLetters.includes(l)).slice(0, 3)]
        .sort(() => Math.random() - 0.5)
      
      availableLetters.value = shuffled.map(char => ({ char, used: false }))
      console.log('Available letters:', availableLetters.value)
    }

    const reorganizeLetters = () => {
      // Don't reorganize automatically - let letters stay in their original positions
      // This prevents the messy layout
      console.log('Letters reorganized')
    }

    const handleLetterClick = (event) => {
      const letter = event.target.getAttribute('data-letter')
      console.log('Letter clicked:', letter)
      console.log('Letter used status:', event.target.classList.contains('used'))
    }

    const dragMoveListener = (event) => {
      const target = event.target
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

      // Remove transition during dragging for smooth movement
      target.style.transition = ''
      target.style.transform = `translate(${x}px, ${y}px)`
      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)

      // Auto-snap detection - check overlap with drop zones
      const dropZones = document.querySelectorAll('.drop-zone')
      const dragRect = target.getBoundingClientRect()
      
      // Clear all visual feedback first
      dropZones.forEach(dropZone => {
        dropZone.classList.remove('drop-target')
      })
      target.classList.remove('can-drop')
      
      dropZones.forEach((dropZone, index) => {
        const dropRect = dropZone.getBoundingClientRect()
        
        // Calculate overlap percentage
        const overlapLeft = Math.max(dragRect.left, dropRect.left)
        const overlapRight = Math.min(dragRect.right, dropRect.right)
        const overlapTop = Math.max(dragRect.top, dropRect.top)
        const overlapBottom = Math.min(dragRect.bottom, dropRect.bottom)
        
        const overlapWidth = Math.max(0, overlapRight - overlapLeft)
        const overlapHeight = Math.max(0, overlapBottom - overlapTop)
        const overlapArea = overlapWidth * overlapHeight
        
        const dragArea = dragRect.width * dragRect.height
        const dropArea = dropRect.width * dropRect.height
        const minArea = Math.min(dragArea, dropArea)
        
        const overlapPercentage = minArea > 0 ? (overlapArea / minArea) * 100 : 0
        
        // Add visual feedback when getting close (50% overlap)
        if (overlapPercentage > 50) {
          dropZone.classList.add('drop-target')
          target.classList.add('can-drop')
        }
        
        // Auto-snap when 85% or more overlap
        if (overlapPercentage >= 85) {
          const slotIndex = parseInt(dropZone.getAttribute('data-slot'))
          const letterId = target.getAttribute('data-letter-id')
          const letterIndex = parseInt(target.getAttribute('data-index'))
          
          // Only auto-snap if the slot is empty or has the same letter ID
          if (!letterSlots.value[slotIndex].letterId || letterSlots.value[slotIndex].letterId === letterId) {
            // Calculate snap position to center
            const offsetX = dropRect.left - dragRect.left + (dropRect.width - dragRect.width) / 2
            const offsetY = dropRect.top - dragRect.top + (dropRect.height - dragRect.height) / 2
            
            // Snap with smooth animation
            target.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            target.style.transform = `translate(${offsetX}px, ${offsetY}px)`
            target.setAttribute('data-x', offsetX)
            target.setAttribute('data-y', offsetY)
            
            // Update the slot with letter ID
            letterSlots.value[slotIndex].letter = target.getAttribute('data-letter')
            letterSlots.value[slotIndex].letterId = letterId
            target.classList.add('used')
            
            // Update available letters
            if (letterIndex >= 0 && letterIndex < availableLetters.value.length) {
              availableLetters.value[letterIndex].used = true
            }
            
            // Reorganize letters to maintain nice order
            reorganizeLetters()
            
            // Remove transition after snapping
            setTimeout(() => {
              target.style.transition = ''
            }, 200)
          }
        }
      })
    }

    const setupInteract = () => {
      console.log('Setting up interact.js...')
      console.log('Interact available:', typeof window.interact)
      
      // Clear any existing interactions first
      window.interact('.draggable-letter').unset()
      window.interact('.drop-zone').unset()
      
      // Make letters draggable - exactly like the original
      window.interact('.draggable-letter')
        .draggable({
          autoScroll: true,
          listeners: { 
            move: dragMoveListener,
            start: function(event) {
              const letterId = event.target.getAttribute('data-letter-id')
              const letterIndex = parseInt(event.target.getAttribute('data-index'))
              console.log('Starting to drag letter:', letterId, 'at index:', letterIndex)
              
              // Remove from any existing slot when starting to drag
              letterSlots.value.forEach((slot, index) => {
                if (slot.letterId === letterId) {
                  console.log('Removing letter from slot:', index)
                  slot.letter = null
                  slot.letterId = null
                }
              })
              
              // Make letter available again - use the letter index directly
              if (letterIndex >= 0 && letterIndex < availableLetters.value.length) {
                availableLetters.value[letterIndex].used = false
                console.log('Made letter available again:', letterId, 'at index:', letterIndex)
              } else {
                console.log('Invalid letter index:', letterIndex, 'available letters length:', availableLetters.value.length)
              }
              
              // Remove used class to make it draggable again
              event.target.classList.remove('used')
              
              // Reset position to original grid position
              event.target.style.transform = 'translate(0px, 0px)'
              event.target.setAttribute('data-x', '0')
              event.target.setAttribute('data-y', '0')
              console.log('Letter reset to original position')
            },
            end: function(event) {
              const letterId = event.target.getAttribute('data-letter-id')
              const isInSlot = letterSlots.value.some(slot => slot.letterId === letterId)
              
              if (!isInSlot) {
                console.log('Letter not in slot, resetting to original position')
                // Reset to original grid position
                event.target.style.transform = 'translate(0px, 0px)'
                event.target.setAttribute('data-x', '0')
                event.target.setAttribute('data-y', '0')
              }
            }
          }
        })

      // Make drop zones droppable - exactly like the original
      window.interact('.drop-zone').dropzone({
        accept: '.draggable-letter',
        overlap: 0.3, // Much more aggressive - only need 30% overlap
        
        ondropactivate: function (event) {
          event.target.classList.add('drop-active')
        },
        ondragenter: function (event) {
          const draggableElement = event.relatedTarget
          const dropzoneElement = event.target
          dropzoneElement.classList.add('drop-target')
          draggableElement.classList.add('can-drop')
        },
        ondragleave: function (event) {
          event.target.classList.remove('drop-target')
          event.relatedTarget.classList.remove('can-drop')
        },
        ondrop: function (event) {
          const draggedElement = event.relatedTarget
          const dropZone = event.target
          const slotIndex = parseInt(dropZone.getAttribute('data-slot'))
          const letterId = draggedElement.getAttribute('data-letter-id')
          const letterIndex = parseInt(draggedElement.getAttribute('data-index'))

          console.log('Dropped letter:', letterId, 'in slot:', slotIndex)

          // Remove letter from previous slot if it was placed
          letterSlots.value.forEach((slot, index) => {
            if (slot.letterId === letterId && index !== slotIndex) {
              slot.letter = null
              slot.letterId = null
            }
          })

          // Place letter in new slot
          letterSlots.value[slotIndex].letter = draggedElement.getAttribute('data-letter')
          letterSlots.value[slotIndex].letterId = letterId
          draggedElement.classList.add('used')
          
          // Snap to center of drop zone with smooth animation
          const dropRect = dropZone.getBoundingClientRect()
          const dragRect = draggedElement.getBoundingClientRect()
          const offsetX = dropRect.left - dragRect.left + (dropRect.width - dragRect.width) / 2
          const offsetY = dropRect.top - dragRect.top + (dropRect.height - dragRect.height) / 2
          
          // Add smooth transition for snapping
          draggedElement.style.transition = 'transform 0.3s ease'
          draggedElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`
          draggedElement.setAttribute('data-x', offsetX)
          draggedElement.setAttribute('data-y', offsetY)
          
          // Remove transition after snapping to allow future dragging
          setTimeout(() => {
            draggedElement.style.transition = ''
          }, 300)

          // Update available letters
          if (letterIndex >= 0 && letterIndex < availableLetters.value.length) {
            availableLetters.value[letterIndex].used = true
          }
          
          // Reorganize letters to maintain nice order
          reorganizeLetters()
        },
        ondropdeactivate: function (event) {
          event.target.classList.remove('drop-active')
          event.target.classList.remove('drop-target')
        }
      })
    }

    const checkAnswer = () => {
      if (!currentWordData.value) return
      
      const userAnswer = letterSlots.value.map(slot => slot.letter).join('')
      const correctAnswer = currentWordData.value.word

      if (userAnswer === correctAnswer) {
        correctAnswers.value++
        alert('Correct! 🎉')
      } else {
        alert(`Incorrect. The correct spelling is: ${correctAnswer}`)
      }

      if (currentWord.value < words.value.length - 1) {
        currentWord.value++
        initializeWord()
        setupInteract()
      } else {
        score.value = Math.round((correctAnswers.value / words.value.length) * 100)
        quizCompleted.value = true

        // Submit to backend
        submitQuizResult()
      }
    }

    const resetCurrentWord = () => {
      if (!currentWordData.value) return
      
      // Clear all letter slots
      letterSlots.value = letterSlots.value.map(() => ({ letter: null, letterId: null }))
      
      // Reset all letters to unused
      availableLetters.value = availableLetters.value.map(letter => ({ ...letter, used: false }))
      
      // Reset letter positions
      document.querySelectorAll('.draggable-letter').forEach(el => {
        el.classList.remove('used')
        el.style.transform = 'translate(0px, 0px)'
        el.setAttribute('data-x', '0')
        el.setAttribute('data-y', '0')
      })
      
      // Re-setup interactions
      setupInteract()
    }

    const submitQuizResult = async () => {
      try {
        const user = store.getters['auth/currentUser']
        await store.dispatch('quizzes/submitQuizResult', {
          userId: user.uid,
          quizId: 'spelling-quiz',
          score: score.value,
          answers: []
        })
      } catch (error) {
        console.error('Error submitting quiz:', error)
      }
    }

    const retakeQuiz = () => {
      currentWord.value = 0
      correctAnswers.value = 0
      quizCompleted.value = false
      score.value = 0
      initializeWord()
      setupInteract()
    }

    const fetchSpellingWords = async () => {
      loading.value = true
      console.log('Fetching spelling words...')
      
      // For now, use sample words to test the drag and drop functionality
      words.value = [
        {
          word: 'SAFETY',
          hint: 'Protection from danger',
          letters: ['S', 'A', 'F', 'E', 'T', 'Y'],
          image: null // Will be set when you upload images
        },
        {
          word: 'TOOLS',
          hint: 'Equipment used for work',
          letters: ['T', 'O', 'O', 'L', 'S'],
          image: null
        },
        {
          word: 'HELMET',
          hint: 'Protective headgear worn on construction sites',
          letters: ['H', 'E', 'L', 'M', 'E', 'T'],
          image: null
        },
        {
          word: 'HAMMER',
          hint: 'Tool for hitting nails',
          letters: ['H', 'A', 'M', 'M', 'E', 'R'],
          image: null
        }
      ]
      
      console.log('Using sample words:', words.value)
      
      // Wait for DOM to update before initializing
      setTimeout(() => {
        initializeWord()
        setupInteract()
      }, 100)
      
      loading.value = false
    }

    onMounted(() => {
      fetchSpellingWords()
    })

    // Re-setup interact when letters change
    watch(availableLetters, () => {
      setTimeout(() => {
        setupInteract()
      }, 100)
    }, { deep: true })

    onUnmounted(() => {
      if (window.interact) {
        window.interact.stop()
      }
    })

    return {
      currentWord,
      letterSlots,
      availableLetters,
      quizCompleted,
      score,
      words,
      loading,
      currentWordData,
      progress,
      isWordComplete,
      checkAnswer,
      resetCurrentWord,
      retakeQuiz
    }
  }
}
</script>

<style scoped>
.spelling-quiz-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 40px 20px;
}

.spelling-quiz-container {
  max-width: 1000px;
  margin: 0 auto;
}

.quiz-header {
  background: var(--bg);
  padding: 30px;
  border-radius: 12px 12px 0 0;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  margin-bottom: 0;
}

.quiz-header h1 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 20px;
}

.quiz-progress span {
  color: var(--text-muted);
  margin-bottom: 10px;
  display: block;
}

.progress-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

.loading-state {
  background: var(--bg);
  padding: 60px 20px;
  border-radius: 0 0 12px 12px;
  text-align: center;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-top: none;
}

.spelling-game {
  background: var(--bg);
  padding: 40px;
  border-radius: 0 0 12px 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  border-top: none;
}

.word-display {
  text-align: center;
  margin-bottom: 40px;
}

.hint-section {
  margin-bottom: 20px;
}

.hint-image {
  margin-bottom: 20px;
}

.hint-image img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hint-text h2 {
  font-size: 1.8rem;
  color: var(--primary);
  margin: 0;
  font-weight: 600;
}


.game-area {
  margin-bottom: 40px;
}

.drop-zones {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.drop-zone {
  width: 60px;
  height: 60px;
  border: 3px dashed var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  transition: all 0.2s ease;
  position: relative;
}

.drop-zone.filled {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.drop-zone.drop-active {
  border-color: var(--primary);
  background: var(--primary);
  opacity: 0.8;
  animation: pulse 0.5s ease-in-out;
}

.drop-zone.drop-target {
  border-color: var(--secondary);
  background: var(--secondary);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.drop-zone .letter {
  font-size: 1.5rem;
  font-weight: bold;
}

.letter-pool {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  justify-items: center;
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  position: relative;
}

.draggable-letter {
  width: 50px;
  height: 50px;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: move;
  transition: transform 0.3s ease, background 0.2s ease;
  user-select: none;
  touch-action: none;
  position: relative;
  z-index: 1000;
  will-change: transform;
}

.draggable-letter:hover:not(.used) {
  background: var(--secondary);
  transform: scale(1.1);
}

.draggable-letter.used {
  opacity: 0.6;
  cursor: move;
  background: #e9ecef;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.draggable-letter.can-drop {
  transform: scale(1.05);
  box-shadow: 0 0 15px var(--primary);
  background: var(--secondary);
}

.game-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.quiz-results {
  background: var(--bg);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.results-card {
  text-align: center;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
}

.score-circle h2 {
  font-size: 3.5rem;
  margin-bottom: 5px;
}

.score-circle p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.results-card h3 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 15px;
}

.results-card > p {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.results-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

@media (max-width: 768px) {
  .word-display h2 {
    font-size: 2rem;
  }
  
  .drop-zone {
    width: 50px;
    height: 50px;
  }
  
  .draggable-letter {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
