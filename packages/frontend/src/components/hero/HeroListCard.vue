<template>
  <div
    class="bg-lol-card border border-lol-border rounded-lg overflow-hidden transition-all duration-200 hover:border-lol-primary"
    :class="{ 'compact-mode': compact }"
  >
    <!-- 主体区域：可点击跳转详情 -->
    <div class="flex items-center gap-3" :class="compact ? 'p-2' : 'p-3'">
      <!-- 头像 -->
      <RouterLink :to="`/hero/${hero.heroId}`" class="shrink-0">
        <div
          class="rounded-lg overflow-hidden bg-lol-border/30"
          :class="compact ? 'w-10 h-10' : 'w-16 h-16'"
        >
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
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-medium text-lol-text truncate" :class="compact ? 'text-xs' : 'text-sm'">
            {{ hero.name }}
          </span>
          <span v-if="!compact" class="text-xs text-lol-muted truncate">{{ hero.title }}</span>
          <span v-if="compact" class="text-xs text-lol-muted">{{ hero.title }}</span>
          <!-- 角色标签：英雄维度下显示 -->
          <template v-if="completed === undefined && hero.roles && hero.roles.length > 0">
            <span
              v-for="role in hero.roles"
              :key="role"
              class="text-xs px-2 py-0.5 rounded-full bg-lol-primary/10 text-lol-primary whitespace-nowrap"
            >
              {{ role }}
            </span>
          </template>
        </div>
        <div v-if="!compact" class="text-xs text-lol-muted truncate mt-0.5">{{ hero.alias }}</div>
      </RouterLink>

      <!-- 成就维度：完成状态、时间、操作 -->
      <div v-if="completed !== undefined" class="shrink-0 flex items-center gap-2">
        <span v-if="completedAt" class="text-xs text-lol-muted whitespace-nowrap">
          {{ formatDate(completedAt) }}
        </span>
        <span
          class="text-xs px-2 py-0.5 rounded-full"
          :class="completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/15 text-red-400'"
        >
          {{ completed ? '已完成' : '未完成' }}
        </span>
        <button
          class="p-1 rounded transition-colors cursor-pointer"
          :class="completed ? 'text-red-400 hover:bg-red-500/15' : 'text-emerald-400 hover:bg-emerald-500/15'"
          :title="completed ? '标记为未完成' : '标记为已完成'"
          @click.stop="toggleCompletion"
        >
          <X v-if="completed" class="w-4 h-4" />
          <Check v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- 总体成就进度条：英雄维度下显示 -->
      <div v-if="completed === undefined && !compact" class="shrink-0 w-24 text-right">
        <div class="text-xs text-lol-muted tabular-nums mb-1">{{ completedCount }}/{{ totalCount }}</div>
        <div class="h-1.5 bg-lol-border rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="completedCount === totalCount && totalCount > 0 ? 'bg-lol-gold' : 'bg-lol-primary'"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
      </div>

      <!-- 展开/折叠按钮：英雄维度下显示 -->
      <button
        v-if="completed === undefined"
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
      enter-to-class="max-h-80 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-80 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="expanded" class="overflow-hidden border-t border-lol-border">
        <div class="p-3 space-y-1 max-h-80 overflow-y-auto">
          <!-- 逐项成就列表：英雄维度下显示 -->
          <template v-if="completed === undefined && heroAchievements.length > 0">
            <div
              v-for="ach in heroAchievements"
              :key="ach.id"
              class="flex items-center gap-2 py-1"
            >
              <CheckCircle2 v-if="ach.completed" class="w-4 h-4 text-lol-gold shrink-0" />
              <Circle v-else class="w-4 h-4 text-lol-muted/40 shrink-0" />
              <span class="text-sm" :class="ach.completed ? 'text-lol-text' : 'text-lol-muted'">
                {{ ach.name }}
              </span>
              <span v-if="ach.completedAt" class="text-xs text-lol-muted ml-auto">
                {{ formatDate(ach.completedAt) }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDown, CheckCircle2, Circle, Check, X } from 'lucide-vue-next'
import { useRecordStore } from '../../stores/record'
import { useAchievementStore } from '../../stores/achievement'

const props = defineProps({
  hero: { type: Object, required: true },
  completed: { type: Boolean, default: undefined },
  completedAt: { type: String, default: '' },
  achievementId: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

async function toggleCompletion() {
  if (!props.achievementId) return
  if (props.completed && !confirm('确认将该成就标记为未完成？')) return
  await recordStore.toggle(props.hero.heroId, props.achievementId)
}

const recordStore = useRecordStore()
const achievementStore = useAchievementStore()

const expanded = ref(false)

const heroAchievements = computed(() => {
  return achievementStore.achievements.map(ach => {
    const rec = recordStore.getRecord(props.hero.heroId, ach.id)
    return { ...ach, completed: rec.completed, completedAt: rec.completedAt }
  })
})

const completedCount = computed(() => heroAchievements.value.filter(a => a.completed).length)
const totalCount = computed(() => achievementStore.achievements.length)

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return (completedCount.value / totalCount.value) * 100
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function onImgError(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%231A2332" width="80" height="80"/><text x="40" y="45" text-anchor="middle" fill="%238B9DAF" font-size="14">?</text></svg>'
}
</script>
