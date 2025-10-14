<template>
  <div class="company-reviews">
    <div class="page-header">
      <h1>Company Reviews</h1>
      <p>Read honest reviews from workers and employers in Singapore</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="filter-group">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search jobs by title, company..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <select v-model="selectedIndustry" class="filter-select">
            <option value="">All Industries</option>
            <option value="construction">Construction</option>
            <option value="hospitality">Hospitality</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="healthcare">Healthcare</option>
            <option value="logistics">Logistics</option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="selectedRating" class="filter-select">
            <option value="">All Ratings</option>
            <option value="5">⭐ 5 Stars</option>
            <option value="4">⭐ 4+ Stars</option>
            <option value="3">⭐ 3+ Stars</option>
          </select>
        </div>

        <button @click="applyFilters" class="btn btn-primary">
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Review Listings -->
    <div class="reviews-container">
      <div v-if="loading" class="loading">
        <p>Loading reviews...</p>
      </div>

      <div v-else-if="filteredReviews.length === 0" class="no-results">
        <p>No reviews found. Try adjusting your filters.</p>
      </div>

      <div v-else class="reviews-grid">
        <div 
          v-for="review in filteredReviews" 
          :key="review.id"
          class="review-card"
        >
          <div class="review-header">
            <div class="company-info">
              <h3>{{ review.company }}</h3>
              <span class="industry-tag">{{ review.industry }}</span>
            </div>
            <div class="rating">
              <span class="stars">{{ getStars(review.rating) }}</span>
              <span class="rating-number">{{ review.rating }}/5</span>
            </div>
          </div>

          <div class="review-body">
            <p class="review-text">{{ review.review }}</p>
            <div class="review-meta">
              <span class="reviewer">By: {{ review.reviewerName }} ({{ review.reviewerType }})</span>
              <span class="date">{{ formatDate(review.date) }}</span>
            </div>
          </div>

          <div class="review-footer">
            <button @click="likeReview(review.id)" class="helpful-btn">
              👍 Helpful ({{ review.likes || 0 }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Review Button -->
    <div class="add-review-section">
      <button @click="showAddReviewModal = true" class="btn btn-primary btn-large">
        ✍️ Write a Review
      </button>
    </div>

    <!-- Add Review Modal (placeholder) -->
    <div v-if="showAddReviewModal" class="modal-overlay" @click="showAddReviewModal = false">
      <div class="modal-content" @click.stop>
        <h2>Write a Review</h2>
        <p style="color: #7f8c8d; margin: 20px 0;">Review functionality coming soon!</p>
        <button @click="showAddReviewModal = false" class="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'CompanyReviews',
  setup() {
    const searchQuery = ref('')
    const selectedIndustry = ref('')
    const selectedRating = ref('')
    const loading = ref(false)
    const showAddReviewModal = ref(false)

    // Mock reviews data - in real app, this would come from Vuex/Firestore
    const reviews = ref([
      {
        id: 1,
        company: 'BuildRight Construction',
        industry: 'construction',
        rating: 4.5,
        review: 'Great company to work for! They treat their workers fairly and pay on time. The working conditions are safe and the management is supportive.',
        reviewerName: 'Ahmad K.',
        reviewerType: 'Worker',
        date: '2025-10-10',
        likes: 15
      },
      {
        id: 2,
        company: 'Singapore Hotel Group',
        industry: 'hospitality',
        rating: 5,
        review: 'Excellent employer! Fair wages, good accommodation, and respectful treatment. I have been working here for 2 years and very satisfied.',
        reviewerName: 'Maria S.',
        reviewerType: 'Worker',
        date: '2025-10-08',
        likes: 23
      },
      {
        id: 3,
        company: 'TechManufacture Pte Ltd',
        industry: 'manufacturing',
        rating: 3.5,
        review: 'Decent workplace but could improve on working hours. Pay is fair and on time. Some communication issues with management.',
        reviewerName: 'Ravi P.',
        reviewerType: 'Worker',
        date: '2025-10-05',
        likes: 8
      },
      {
        id: 4,
        company: 'HealthCare Plus',
        industry: 'healthcare',
        rating: 4.8,
        review: 'Very professional organization. Good training provided and supportive team. Highly recommend for healthcare workers.',
        reviewerName: 'Chen W.',
        reviewerType: 'Worker',
        date: '2025-10-03',
        likes: 19
      },
      {
        id: 5,
        company: 'FastLogistics Co',
        industry: 'logistics',
        rating: 4.0,
        review: 'Reliable workers, professional attitude. Good communication and punctuality. Would hire again.',
        reviewerName: 'John T.',
        reviewerType: 'Employer',
        date: '2025-10-01',
        likes: 12
      }
    ])

    const filteredReviews = computed(() => {
      let result = reviews.value

      if (searchQuery.value) {
        result = result.filter(review =>
          review.company.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedIndustry.value) {
        result = result.filter(review => 
          review.industry === selectedIndustry.value
        )
      }

      if (selectedRating.value) {
        const minRating = parseFloat(selectedRating.value)
        result = result.filter(review => 
          review.rating >= minRating
        )
      }

      return result
    })

    const applyFilters = () => {
      loading.value = true
      setTimeout(() => {
        loading.value = false
      }, 300)
    }

    const getStars = (rating) => {
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 >= 0.5
      let stars = '⭐'.repeat(fullStars)
      if (hasHalfStar) stars += '½'
      return stars
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-SG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const likeReview = (reviewId) => {
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) {
        review.likes = (review.likes || 0) + 1
      }
    }

    onMounted(() => {
      applyFilters()
    })

    return {
      searchQuery,
      selectedIndustry,
      selectedRating,
      loading,
      showAddReviewModal,
      filteredReviews,
      applyFilters,
      getStars,
      formatDate,
      likeReview
    }
  }
}
</script>

<style scoped>
.company-reviews {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.filters-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.filters-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3498db;
}

.reviews-container {
  min-height: 400px;
  margin-bottom: 40px;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.reviews-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.review-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.company-info h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.industry-tag {
  background: #e8f4f8;
  color: #3498db;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.stars {
  font-size: 1.3rem;
}

.rating-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f39c12;
}

.review-body {
  margin-bottom: 20px;
}

.review-text {
  color: #2c3e50;
  line-height: 1.7;
  margin-bottom: 15px;
  font-size: 1rem;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.reviewer {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.date {
  color: #95a5a6;
  font-size: 0.9rem;
}

.review-footer {
  display: flex;
  justify-content: flex-end;
}

.helpful-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.helpful-btn:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.add-review-section {
  text-align: center;
  padding: 40px 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.modal-content h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .review-header {
    flex-direction: column;
  }

  .rating {
    align-items: flex-start;
  }
}
</style>

