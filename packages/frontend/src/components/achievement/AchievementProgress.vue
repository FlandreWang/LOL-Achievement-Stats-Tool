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
          <div class="liquid-fill" :style="fillStyle"></div>
          <svg class="liquid-wave liquid-wave-back" :style="{ top: `${liquidOffset}%` }" viewBox="0 0 800 14" preserveAspectRatio="none">
            <path
              :fill="waveColor"
              d="M0,7 C20,3 30,11 50,7 C70,3 80,11 100,7 C120,3 130,11 150,7 C170,3 180,11 200,7 C220,3 230,11 250,7 C270,3 280,11 300,7 C320,3 330,11 350,7 C370,3 380,11 400,7 C420,3 430,11 450,7 C470,3 480,11 500,7 C520,3 530,11 550,7 C570,3 580,11 600,7 C620,3 630,11 650,7 C670,3 680,11 700,7 C720,3 730,11 750,7 C770,3 780,11 800,7 L800,14 L0,14 Z"
            />
          </svg>
          <svg class="liquid-wave liquid-wave-front" :style="{ top: `${liquidOffset}%` }" viewBox="0 0 800 14" preserveAspectRatio="none">
            <path
              :fill="waveColor"
              d="M0,7 C25,2 35,12 60,7 C85,2 95,12 120,7 C145,2 155,12 180,7 C205,2 215,12 240,7 C265,2 275,12 300,7 C325,2 335,12 360,7 C385,2 395,12 420,7 C445,2 455,12 480,7 C505,2 515,12 540,7 C565,2 575,12 600,7 C625,2 635,12 660,7 C685,2 695,12 720,7 C745,2 755,12 780,7 L800,7 L800,14 L0,14 Z"
            />
          </svg>
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

// 根据百分比动态计算渐变色
const colorStops = [
  { pct: 0,   bottom: [200, 60, 60],   top: [240, 100, 100] },  // 红
  { pct: 30,  bottom: [220, 140, 50],  top: [250, 180, 90] },   // 橙
  { pct: 60,  bottom: [60, 100, 210],  top: [110, 150, 240] },  // 蓝
  { pct: 90,  bottom: [50, 180, 150],  top: [90, 220, 190] },   // 青绿
  { pct: 100, bottom: [180, 150, 70],  top: [220, 190, 110] },  // 金
]

function lerpColor(c1, c2, t) {
  return c1.map((v, i) => Math.round(v + (c2[i] - v) * t))
}

function getColor(pct) {
  for (let i = 1; i < colorStops.length; i++) {
    if (pct <= colorStops[i].pct) {
      const prev = colorStops[i - 1]
      const t = (pct - prev.pct) / (colorStops[i].pct - prev.pct)
      return {
        bottom: lerpColor(prev.bottom, colorStops[i].bottom, t),
        top: lerpColor(prev.top, colorStops[i].top, t),
      }
    }
  }
  const last = colorStops[colorStops.length - 1]
  return { bottom: last.bottom, top: last.top }
}

const currentColors = computed(() => getColor(percent.value))

const fillStyle = computed(() => {
  const c = currentColors.value
  return {
    top: `${liquidOffset.value}%`,
    background: `linear-gradient(to top, rgb(${c.bottom.join(',')}), rgb(${c.top.join(',')}))`,
  }
})

const waveColor = computed(() => {
  const c = currentColors.value.top
  return `rgb(${c.join(',')})`
})

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
}

.liquid-wave {
  position: absolute;
  left: -1px;
  right: -1px;
  height: 14px;
  transition: top 0.8s ease;
  pointer-events: none;
}

.liquid-wave-front {
  animation: waveFlow 3s linear infinite;
}

.liquid-wave-back {
  opacity: 0.4;
  animation: waveFlow 5s linear infinite reverse;
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
