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
          <div class="liquid-fill" :style="{ top: `${liquidOffset}%`, background: fillGradient }">
            <svg class="liquid-wave liquid-wave-back" viewBox="0 0 400 22" preserveAspectRatio="none">
              <path
                :fill="waveBackColor"
                d="M0,12 C15,6 20,18 35,12 C50,6 55,18 70,12 C85,6 90,18 105,12 C120,6 125,18 140,12 C155,6 160,18 175,12 C190,6 195,18 210,12 C225,6 230,18 245,12 C260,6 265,18 280,12 C295,6 300,18 315,12 C330,6 335,18 350,12 C365,6 370,18 385,12 L400,12 L400,22 L0,22 Z"
              />
            </svg>
            <svg class="liquid-wave" viewBox="0 0 400 22" preserveAspectRatio="none">
              <path
                :fill="waveColor"
                d="M0,10 C12,4 18,16 30,10 C42,4 48,16 60,10 C72,4 78,16 90,10 C102,4 108,16 120,10 C132,4 138,16 150,10 C162,4 168,16 180,10 C192,4 198,16 210,10 C222,4 228,16 240,10 C252,4 258,16 270,10 C282,4 288,16 300,10 C312,4 318,16 330,10 C342,4 348,16 360,10 C372,4 378,16 390,10 L400,10 L400,22 L0,22 Z"
              />
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

const fillGradient = computed(() => {
  const c = currentColors.value
  return `linear-gradient(to top, rgb(${c.bottom.join(',')}), rgb(${c.top.join(',')}))`
})

const waveColor = computed(() => {
  const c = currentColors.value.top
  return `rgb(${c.join(',')})`
})

const waveBackColor = computed(() => {
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
  bottom: -4px;
  transition: top 0.8s ease;
}

.liquid-wave {
  position: absolute;
  top: -7px;
  left: -1px;
  right: -1px;
  height: 22px;
  animation: waveFlow 4s linear infinite;
}

.liquid-wave-back {
  top: -4px;
  height: 20px;
  opacity: 0.35;
  animation: waveFlowBack 6s linear infinite;
}

@keyframes waveFlow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes waveFlowBack {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
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
