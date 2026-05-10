<template>
  <div class="achievement-progress" :class="{ completed: isCompleted }">
    <!-- 左侧：进度环 -->
    <div class="progress-ring-wrapper">
      <svg class="progress-ring" :width="ringSize" :height="ringSize" viewBox="0 0 100 100">
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
      <!-- 中心：液面球体 + 数字 -->
      <div class="progress-ring-content">
        <div class="liquid-ball" :class="{ completed: isCompleted }">
          <div class="liquid-fill" :style="{ top: `${liquidOffset}%` }">
            <svg class="liquid-wave" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M0,10 C25,0 25,20 50,10 C75,0 75,20 100,10 C125,0 125,20 150,10 C175,0 175,20 200,10 L200,20 L0,20 Z" />
            </svg>
          </div>
        </div>
        <span class="progress-percent">{{ percent }}%</span>
      </div>
    </div>

    <!-- 右侧：详细信息 -->
    <div class="progress-info">
      <div class="progress-title">{{ achievementName }}</div>
      <div v-if="description" class="progress-desc">{{ description }}</div>
      <div class="progress-stats">
        <span class="progress-completed">{{ completed }}</span>
        <span class="progress-separator">/</span>
        <span class="progress-total">{{ total }}</span>
      </div>
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
  description: { type: String, default: '' },
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

// 液面偏移：0% 时在底部(100%)，100% 时充满(0%)
const liquidOffset = computed(() => 100 - percent.value)

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
  background: var(--color-card, #FFFFFF);
  border: 1px solid var(--color-border, #E0E0E0);
  border-radius: 0.75rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.achievement-progress.completed {
  border-color: var(--color-gold, #C8AA6E);
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

.progress-ring-fill {
  stroke: url(#progressGradient);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease;
}

.completed .progress-ring-fill {
  stroke: var(--color-gold, #C8AA6E);
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
  color: var(--color-text, #E8DFD1);
  font-variant-numeric: tabular-nums;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 4px var(--color-card, #1A2332);
}

.completed .progress-percent {
  color: var(--color-gold, #C8AA6E);
}

/* 液面球体 */
.liquid-ball {
  position: absolute;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-card, #1A2332);
  border: 1px solid rgba(90, 130, 230, 0.3);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.15);
}

.liquid-ball.completed {
  border-color: var(--color-gold, #C8AA6E);
  box-shadow:
    inset 0 0 8px rgba(0, 0, 0, 0.1),
    0 0 12px rgba(200, 170, 90, 0.4);
}

.liquid-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  transition: top 0.8s ease;
  background: rgba(90, 130, 230, 0.5);
}

.liquid-wave {
  position: absolute;
  top: -7px;
  left: -1px;
  right: -1px;
  height: 14px;
  animation: waveFlow 3s linear infinite;
}

.liquid-wave path {
  fill: rgba(90, 130, 230, 0.5);
}

.completed .liquid-fill {
  background: rgba(200, 170, 90, 0.55);
}

.completed .liquid-wave path {
  fill: rgba(200, 170, 90, 0.55);
}

@keyframes waveFlow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 详细信息 */
.progress-info {
  flex: 1;
  min-width: 0;
}

.progress-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text, #E8DFD1);
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
  color: var(--color-primary, #0AC8B9);
  font-variant-numeric: tabular-nums;
}

.completed .progress-completed {
  color: var(--color-gold, #C8AA6E);
}

.progress-separator {
  font-size: 1rem;
  color: var(--color-muted, #8B9DAF);
}

.progress-total {
  font-size: 1rem;
  color: var(--color-muted, #8B9DAF);
  font-variant-numeric: tabular-nums;
}

.progress-desc {
  font-size: 0.75rem;
  color: var(--color-muted, #8B9DAF);
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  background: var(--color-gold, #C8AA6E);
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
