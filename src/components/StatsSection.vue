<template>
  <div class="stats-section">
    <div class="stats-container">
      <div class="stats-grid">
        <AnimatedStat
          :icon="briefcaseIcon"
          :value="10000"
          suffix="+"
          label="Active Job Seekers"
          :delay="0"
        />
        <AnimatedStat
          :icon="buildingIcon"
          :value="5000"
          suffix="+"
          label="Registered Employers"
          :delay="100"
        />
        <AnimatedStat
          :icon="briefcaseIcon"
          :value="15000"
          suffix="+"
          label="Jobs Posted"
          :delay="200"
        />
        <AnimatedStat
          :icon="usersIcon"
          :value="8000"
          suffix="+"
          label="Successful Hires"
          :delay="300"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AnimatedStat from './AnimatedStat.vue'
import briefcaseIcon from '../assets/briefcase.svg'
import buildingIcon from '../assets/corporate.svg'
import usersIcon from '../assets/user.svg'

export default {
  name: 'StatsSection',
  components: {
    AnimatedStat
  },
  setup() {
    const base = import.meta.env.BASE_URL

    return { base, briefcaseIcon, buildingIcon, usersIcon }
  }
}
</script>

<style scoped>
.stats-section {
  background: linear-gradient(to bottom, var(--bg), var(--bg-light));
  padding: 48px 0;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-section {
    padding: 32px 0;
  }
}
</style>

