<template>
  <div class="company-reviews-page">
    <!-- Page Header -->
    <section class="reviews-header-section">
      <div class="container">
        <div class="header-content">
          <h2>Company Reviews</h2>
          <p class="reviews-description">Read honest reviews from workers and employers in Singapore</p>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section class="reviews-section">
      <div class="container">
        <div class="reviews-layout">
          <!-- Filter Sidebar -->
          <aside class="filter-sidebar-wrapper">
            <div class="filter-sidebar">
              <div class="filter-section">
                <h4>Filters</h4>
                
                <!-- Search Bar -->
                <div class="search-bar-wrapper">
                  <img src="/icons/search.svg" alt="Search" class="search-icon" />
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search companies..."
                    class="search-input"
                  />
                </div>
              </div>

              <div class="separator"></div>

              <!-- Industry Filter -->
              <div class="filter-section">
                <h4>Industry</h4>
                <div class="filter-options">
                  <label v-for="industry in industries" :key="industry.value" class="filter-option">
                    <input
                      type="checkbox"
                      :value="industry.value"
                      v-model="selectedIndustries"
                    />
                    <span>{{ industry.label }}</span>
                  </label>
                </div>
              </div>

              <div class="separator"></div>

              <!-- Rating Filter -->
              <div class="filter-section">
                <h4>Rating</h4>
                <div class="filter-options">
                  <label class="filter-option">
                    <input type="checkbox" value="5" v-model="selectedRatings" />
                    <span>⭐⭐⭐⭐⭐ 5 Stars</span>
                  </label>
                  <label class="filter-option">
                    <input type="checkbox" value="4" v-model="selectedRatings" />
                    <span>⭐⭐⭐⭐ 4+ Stars</span>
                  </label>
                  <label class="filter-option">
                    <input type="checkbox" value="3" v-model="selectedRatings" />
                    <span>⭐⭐⭐ 3+ Stars</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="reviews-main-content">
            <!-- Header with Count -->
            <div class="reviews-header">
              <div>
                <h2>Company Reviews</h2>
                <p class="reviews-count">{{ filteredReviews.length }} reviews</p>
              </div>
              <button @click="showAddReviewModal = true" class="btn btn-primary">
                Write a Review
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="reviews-grid">
              <div v-for="n in 6" :key="n" class="review-card-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-body"></div>
                <div class="skeleton-footer"></div>
              </div>
            </div>

            <!-- No Results -->
            <div v-else-if="filteredReviews.length === 0" class="no-results">
              <p>No reviews found. Try adjusting your filters.</p>
            </div>

            <!-- Reviews Grid -->
            <div v-else class="reviews-grid">
              <div 
                v-for="review in filteredReviews" 
                :key="review.id"
                class="review-card"
              >
                <div class="review-header">
                  <div class="company-info">
                    <h3>{{ review.company }}</h3>
                    <span class="industry-tag">{{ getIndustryLabel(review.industry) }}</span>
                  </div>
                  <div class="rating">
                    <div class="stars-container">
                      <img 
                        v-for="n in Math.floor(review.rating)" 
                        :key="n" 
                        src="/icons/star.svg" 
                        alt="Star" 
                        class="star-icon"
                      />
                      <span v-if="review.rating % 1 >= 0.5" class="half-star">½</span>
                    </div>
                    <span class="rating-number">{{ review.rating }}/5</span>
                  </div>
                </div>

                <div class="review-body">
                  <p class="review-text">{{ review.review }}</p>
                </div>

                <div class="review-footer">
                  <div class="review-meta">
                    <span class="reviewer">{{ review.reviewerName }} ({{ review.reviewerType }})</span>
                    <span class="date">{{ formatDate(review.date) }}</span>
                  </div>
                  <button 
                    @click="likeReview(review.id)" 
                    class="helpful-btn"
                    :class="{ 'is-liked': review.isLiked }"
                  >
                    <img src="/icons/thumbs-up.svg?v=2" alt="Thumbs up" class="thumbs-icon" />
                    <span>Helpful ({{ review.likes || 0 }})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Add Review Modal -->
    <div v-if="showAddReviewModal" class="modal-overlay" @click="showAddReviewModal = false">
      <div class="modal-content" @click.stop>
        <h2>Write a Review</h2>
        <p style="color: hsl(198, 4%, 52%); margin: 20px 0;">Review functionality coming soon!</p>
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
    const selectedIndustries = ref([])
    const selectedRatings = ref([])
    const loading = ref(false)
    const showAddReviewModal = ref(false)

    const industries = [
      { value: 'construction', label: 'Construction' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'hospitality', label: 'Hospitality' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'logistics', label: 'Logistics' },
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'security', label: 'Security' },
      { value: 'facilities', label: 'Facilities' }
    ]

    // Mock reviews data
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
        likes: 15,
        isLiked: false
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
        likes: 23,
        isLiked: false
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
        likes: 8,
        isLiked: false
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
        likes: 19,
        isLiked: false
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
        likes: 12,
        isLiked: false
      }
    ])

    const filteredReviews = computed(() => {
      let result = reviews.value

      if (searchQuery.value) {
        result = result.filter(review =>
          review.company.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedIndustries.value.length > 0) {
        result = result.filter(review => 
          selectedIndustries.value.includes(review.industry)
        )
      }

      if (selectedRatings.value.length > 0) {
        result = result.filter(review => 
          selectedRatings.value.some(rating => review.rating >= parseFloat(rating))
        )
      }

      return result
    })

    const getIndustryLabel = (value) => {
      const industry = industries.find(i => i.value === value)
      return industry ? industry.label : value
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
        if (review.isLiked) {
          // Unlike - decrease count
          review.likes = Math.max(0, (review.likes || 0) - 1)
          review.isLiked = false
        } else {
          // Like - increase count
          review.likes = (review.likes || 0) + 1
          review.isLiked = true
        }
      }
    }

    onMounted(() => {
      loading.value = true
      setTimeout(() => {
        loading.value = false
      }, 300)
    })

    return {
      searchQuery,
      selectedIndustries,
      selectedRatings,
      loading,
      showAddReviewModal,
      filteredReviews,
      industries,
      getIndustryLabel,
      formatDate,
      likeReview
    }
  }
}
</script>

<style scoped>
.company-reviews-page {
  width: 100%;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Section */
.reviews-header-section {
  background: var(--bg);
  padding: 40px 0;
  border-bottom: 1px solid var(--border);
}

.header-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.2;
}

.reviews-description {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Reviews Section */
.reviews-section {
  padding: 40px 0;
  background: var(--bg);
}

.reviews-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

/* Filter Sidebar */
.filter-sidebar {
  background: var(--bg);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.dark-mode .filter-sidebar {
  border-color: rgba(255, 255, 255, 0.1);
}

.filter-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.separator {
  height: 1px;
  background: var(--border);
  margin: 24px 0;
}

.search-bar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg);
  color: var(--text);
}

.dark-mode .search-input {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text);
  cursor: pointer;
}

.filter-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Reviews Main Content */
.reviews-main-content {
  width: 100%;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.reviews-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.reviews-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

/* Reviews Grid */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

/* Review Card */
.review-card {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.dark-mode .review-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.review-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.company-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
}

.industry-tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--bg-light);
  color: var(--text);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stars-container {
  display: flex;
  gap: 2px;
  align-items: center;
}

.star-icon {
  width: 16px;
  height: 16px;
}

.half-star {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.rating-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.review-body {
  margin-bottom: 16px;
}

.review-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .review-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.review-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text);
}

.date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.helpful-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.helpful-btn:hover:not(.is-liked) {
  background: var(--bg);
  border-color: var(--primary);
}


.helpful-btn.is-liked {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.helpful-btn.is-liked:hover {
  background: var(--primary);
  border-color: var(--primary);
}

.helpful-btn.is-liked .thumbs-icon {
  filter: brightness(0) invert(1);
}

.thumbs-icon {
  width: 16px;
  height: 16px;
  transition: all 0.2s;
}

/* Skeleton Loading */
.review-card-skeleton {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 24px;
}

.skeleton-header {
  height: 80px;
  background: var(--bg-light);
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-body {
  height: 120px;
  background: var(--bg-light);
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-footer {
  height: 40px;
  background: var(--bg-light);
  border-radius: 8px;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.dark-mode .modal-content {
  background: #1a1a1a;
}

.modal-content h2 {
  color: var(--text);
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 1200px) {
  .reviews-layout {
    grid-template-columns: 260px 1fr;
  }
}

@media (max-width: 992px) {
  .reviews-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .filter-sidebar {
    position: static;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .reviews-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-content h2 {
    font-size: 1.75rem;
  }
}
</style>
