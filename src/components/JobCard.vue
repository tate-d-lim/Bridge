<template>
  <div class="job-card">
    <div class="job-card-header">
      <h3>{{ job.title }}</h3>
      <button @click="saveJob" class="save-btn" title="Save job">
        💾
      </button>
    </div>

    <p class="company">{{ job.company }}</p>

    <div class="job-details">
      <span class="detail-item">
        <span class="icon">📍</span>
        {{ job.location }}
      </span>
      <span class="detail-item">
        <span class="icon">💰</span>
        ${{ job.salary }}
      </span>
      <span class="detail-item">
        <span class="icon">⏰</span>
        {{ job.type || 'Full-time' }}
      </span>
    </div>

    <div class="job-tags">
      <span class="tag">{{ job.category }}</span>
    </div>

    <p class="job-description">
      {{ truncateDescription(job.description) }}
    </p>

    <div class="job-footer">
      <span class="posted-date">{{ formatDate(job.createdAt) }}</span>
      <router-link :to="`/jobs/${job.id}`" class="btn btn-primary">
        View Details
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobCard',
  props: {
    job: {
      type: Object,
      required: true
    }
  },
  methods: {
    truncateDescription(description) {
      if (!description) return ''
      return description.length > 120 
        ? description.substring(0, 120) + '...' 
        : description
    },
    formatDate(dateString) {
      if (!dateString) return 'Recently'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString()
    },
    saveJob() {
      // TODO: Implement save job functionality
      console.log('Job saved:', this.job.id)
    }
  }
}
</script>

<style scoped>
.job-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.job-card-header h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.save-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.save-btn:hover {
  transform: scale(1.2);
}

.company {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.icon {
  font-size: 1rem;
}

.job-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  background: #e8f4f8;
  color: #3498db;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.job-description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.posted-date {
  color: #95a5a6;
  font-size: 0.9rem;
}
</style>

