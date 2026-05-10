<template>
  <div class="bg-lol-card border border-lol-border rounded-lg overflow-hidden transition-all duration-200 hover:border-lol-primary">
    <!-- 主体区域：可点击跳转详情 -->
    <div class="flex items-center gap-3 p-3">
      <!-- 头像 -->
      <RouterLink :to="`/hero/${hero.heroId}`" class="shrink-0">
        <div class="w-16 h-16 rounded-lg overflow-hidden bg-lol-border/30">
          <img
            :src="hero.avatar"
            :alt="hero.name"
            class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            loading="lazy"
            @error="onImgError"
          />
        </div>
      </RouterLink>

      <!-- 信息区域 -->
      <RouterLink :to="`/hero/${hero.heroId}`" class="flex-1 min-w-0">
        <div class="text-sm font-medium text-lol-text truncate">{{ hero.name }}</div>
        <div class="text-xs text-lol-muted truncate">{{ hero.title }}</div>
        <!-- 成就tab：显示完成状态 -->
        <div v-if="completed !== undefined" class="mt-1">
          <span
            class="text-xs px-1.5 py-0.5 rounded"
            :class="completed ? 'bg-lol-gold/20 text-lol-gold' : 'bg-lol-border/30 text-lol-muted'"
          >
            {{ completed ? '已完成' : '未完成' }}
          </span>
          <span v-if="completedAt" class="text-xs text-lol-muted ml-1.5">
            {{ formatDate(completedAt) }}
          </span>
        </div>
      </RouterLink>

      <!-- 展开/折叠按钮 -->
      <button
        class="shrink-0 p-2 rounded-lg text-lol-muted hover:text-lol-text hover:bg-lol-border/30 transition-colors"
        @click.stop="expanded = !expanded"
      >
        <ChevronDown
          class="w-5 h-5 transition-transform duration-300"
          :class="{ 'rotate-180': expanded }"
        />
      </button>
    </div>

    <!-- 展开内容 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-40 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-40 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="expanded" class="overflow-hidden border-t border-lol-border">
        <div class="p-3 space-y-2">
          <!-- 角色标签 -->
          <div v-if="hero.roles && hero.roles.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="role in hero.roles"
              :key="role"
              class="text-xs px-2 py-0.5 rounded-full bg-lol-primary/10 text-lol-primary"
            >
              {{ role }}
            </span>
          </div>

          <!-- 成就进度 -->
          <div v-if="achievements && achievements.length > 0">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs text-lol-muted">成就进度</span>
              <span class="text-xs text-lol-muted tabular-nums">{{ completedCount }}/{{ achievements.length }}</span>
            </div>
            <div class="h-1.5 bg-lol-border rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="completedCount === achievements.length ? 'bg-lol-gold' : 'bg-lol-primary'"
                :style="{ width: progressPercent + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  hero: { type: Object, required: true },
  completed: { type: Boolean, default: undefined },
  completedAt: { type: String, default: '' },
  achievements: { type: Array, default: () => [] },
})

const expanded = ref(false)

const completedCount = computed(() => {
  if (!props.achievements) return 0
  return props.achievements.filter(a => a.completed).length
})

const progressPercent = computed(() => {
  if (!props.achievements || props.achievements.length === 0) return 0
  return (completedCount.value / props.achievements.length) * 100
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

function onImgError(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%231A2332" width="80" height="80"/><text x="40" y="45" text-anchor="middle" fill="%238B9DAF" font-size="14">?</text></svg>'
}
</script>
