<template>
  <div class="achievement-progress" :class="{ completed: isCompleted }">
    <!-- 左侧：进度环 -->
    <div class="progress-ring-wrapper">
      <svg class="progress-ring" :width="ringSize" :height="ringSize" viewBox="0 0 100 100">
        <!-- 背景环 -->
        <circle
          class="progress-ring-bg"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          :stroke-width="strokeWidth"
        />
        <!-- 进度环 -->
        <circle
          class="progress-ring-fill"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <!-- 中心数字 -->
      <div class="progress-ring-content">
        <span class="progress-percent">{{ percent }}%</span>
      </div>
    </div>

    <!-- 右侧：详细信息 -->
    <div class="progress-info">
      <div class="progress-title">{{ achievementName }}</div>
      <div class="progress-stats">
        <span class="progress-completed">{{ completed }}</span>
        <span class="progress-separator">/</span>
        <span class="progress-total">{{ total }}</span>
      </div>
      <div class="progress-label">已完成</div>
    </div>

    <!-- 完成时的粒子效果 -->
    <div v-if="isCompleted" class="particles">
      <div v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completed: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  achievementName: { type: String, default: '' },
})

const ringSize = 100
const strokeWidth = 8
const radius = 42
const circumference = 2 * Math.PI * radius

const percent = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.completed / props.total) * 100)
})

const strokeDashoffset = computed(() => {
  const offset = circumference - (percent.value / 100) * circumference
  return offset
})

const isCompleted = computed(() => props.total > 0 && props.completed === props.total)

function particleStyle(index) {
  const angle = (index - 1) * 30
  const delay = index * 0.1
  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}s`,
  }
}
</script>

<style scoped>
.achievement-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--lol-card);
  border: 1px solid var(--lol-border);
  border-radius: 0.75rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.achievement-progress.completed {
  border-color: var(--lol-gold);
  box-shadow: 0 0 20px rgba(200, 170, 90, 0.2);
}

/* 进度环 */
.progress-ring-wrapper {
  position: relative;
  flex-shrink: 0;
}

.progress-ring {
  display: block;
}

.progress-ring-bg {
  stroke: var(--lol-border);
  transition: stroke 0.3s ease;
}

.progress-ring-fill {
  stroke: url(#progressGradient);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease;
}

.completed .progress-ring-fill {
  stroke: var(--lol-gold);
  animation: goldPulse 2s ease-in-out infinite;
}

.progress-ring-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-percent {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--lol-text);
  font-variant-numeric: tabular-nums;
}

.completed .progress-percent {
  color: var(--lol-gold);
}

/* 详细信息 */
.progress-info {
  flex: 1;
  min-width: 0;
}

.progress-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lol-text);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-stats {
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
  margin-bottom: 0.125rem;
}

.progress-completed {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--lol-primary);
  font-variant-numeric: tabular-nums;
}

.completed .progress-completed {
  color: var(--lol-gold);
}

.progress-separator {
  font-size: 1rem;
  color: var(--lol-muted);
}

.progress-total {
  font-size: 1rem;
  color: var(--lol-muted);
  font-variant-numeric: tabular-nums;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--lol-muted);
}

/* 粒子效果 */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--lol-gold);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particleBurst 1.5s ease-out infinite;
  animation-delay: var(--delay);
}

@keyframes goldPulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

@keyframes particleBurst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px) scale(0);
    opacity: 0;
  }
}
</style>
