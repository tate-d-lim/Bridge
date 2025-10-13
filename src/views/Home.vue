<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Bridge</h1>
        <p class="hero-subtitle">Connecting Singapore Employers with Skilled Migrant Workers</p>
        <p class="hero-description">
          Skip the expensive middlemen. Find jobs or hire talent directly through our platform.
        </p>
        <div class="hero-buttons">
          <router-link to="/jobs" class="btn btn-primary">Browse Jobs</router-link>
          <router-link to="/register" class="btn btn-secondary">Get Started</router-link>
        </div>
      </div>
      <div class="hero-image">
        <img src="../assets/bridgeLogo.png" alt="Bridge Logo" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2>Why Choose Bridge?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">💼</div>
          <h3>Direct Connection</h3>
          <p>Connect directly with employers or job seekers without expensive agencies</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>AI-Powered Matching</h3>
          <p>Smart job matching based on skills, experience, and preferences</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📚</div>
          <h3>Skill Development</h3>
          <p>Take AI-generated quizzes to upskill and earn badges</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3>Real-time Chat</h3>
          <p>Communicate directly with potential employers or candidates</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <h3>Review System</h3>
          <p>Transparent reviews and ratings for both employers and workers</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>Mobile Friendly</h3>
          <p>Access the platform anywhere, anytime from any device</p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stat-item">
        <h3>10,000+</h3>
        <p>Active Job Seekers</p>
      </div>
      <div class="stat-item">
        <h3>5,000+</h3>
        <p>Registered Employers</p>
      </div>
      <div class="stat-item">
        <h3>15,000+</h3>
        <p>Jobs Posted</p>
      </div>
      <div class="stat-item">
        <h3>8,000+</h3>
        <p>Successful Hires</p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>Ready to Get Started?</h2>
      <p>Join thousands of employers and job seekers on Bridge today</p>
      <router-link to="/register" class="btn btn-primary btn-large">Create Free Account</router-link>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  width: 100%;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 60px;
}

.hero-content {
  flex: 1;
}

.hero h1 {
  font-size: 3.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #3498db;
  margin-bottom: 15px;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 15px;
}

.hero-image {
  flex: 1;
  text-align: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.features {
  background: #f8f9fa;
  padding: 80px 20px;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 50px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 10px;
  font-weight: 700;
}

.stat-item p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.cta {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.cta p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    flex-direction: column;
  }
}
</style>

