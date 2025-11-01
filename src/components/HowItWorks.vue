<template>
  <div class="how-it-works">
    <div class="container">
      <div class="text-center mb-12">
        <h2 class="section-title">How It Works</h2>
        <p class="section-description">
          Getting started with Bridge is easy. Follow these simple steps to find your dream job.
        </p>
      </div>

      <div class="steps-grid">
        <!-- Connection line for desktop -->
        <div class="connection-line"></div>

        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="step-content">
            <!-- Icon -->
            <div class="step-icon-container">
              <div class="step-icon-wrapper" :class="step.colorClass">
                <div class="step-icon-inner">
                  <img
                    :src="iconSrc(step.icon)"
                    :alt="step.title"
                    class="step-icon"
                  />
                </div>
              </div>
            </div>

            <!-- Content -->
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HowItWorks",
  setup() {
    // Path to your icons folder in /public/icons
    const base = import.meta.env.BASE_URL
    const iconSrc = (file) => base + "icons/" + file

    const steps = [
      {
        icon: "search.svg",
        title: "Browse Jobs",
        description: "Search through thousands of verified job listings from top employers across Singapore.",
        colorClass: "gradient-blue",
      },
      {
        icon: "file-text.svg",
        title: "Apply Online",
        description: "Submit your application with just a few clicks. No complicated forms or paperwork.",
        colorClass: "gradient-purple",
      },
      {
        icon: "check-circle.svg",
        title: "Get Matched",
        description: "Employers review your application and reach out if you're a good fit for the position.",
        colorClass: "gradient-orange",
      },
      {
        icon: "rocket.svg",
        title: "Start Working",
        description: "Complete the hiring process and start your new job with competitive pay and benefits.",
        colorClass: "gradient-green",
      },
    ]

    return { steps, iconSrc }
  },
}
</script>

<style scoped>
.how-it-works {
  background: var(--bg);
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center {
  text-align: center;
}

.mb-12 {
  margin-bottom: 48px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  position: relative;
}

/* Connection line for desktop */
.connection-line {
  display: none;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--border), transparent);
  z-index: 1;
}

.step-item {
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.6s ease-out forwards;
}

.step-content {
  text-align: center;
  position: relative;
}


.step-icon-container {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.step-icon-wrapper {
  height: 64px;
  width: 64px;
  border-radius: 16px;
  padding: 2px;
  position: relative;
}

.step-icon-inner {
  height: 100%;
  width: 100%;
  border-radius: 16px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.step-icon-inner::before {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 14px;
  z-index: 1;
}

.step-icon {
  width: 28px;
  height: 28px;
  position: relative;
  z-index: 2;
  filter: brightness(0) invert(1);
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.3;
}

.step-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
}

/* Gradient classes */
.gradient-blue .step-icon-inner::before {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
}

.gradient-purple .step-icon-inner::before {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}

.gradient-orange .step-icon-inner::before {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.gradient-green .step-icon-inner::before {
  background: linear-gradient(135deg, #10b981, #059669);
}

/* Animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (min-width: 1024px) {  
  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .how-it-works {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .step-description {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }
  
  .section-description {
    font-size: 1rem;
  }
}
</style>
