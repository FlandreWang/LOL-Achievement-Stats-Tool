<template>
  <div>
    <!-- 无成就空状态 -->
    <EmptyState
      v-if="achievements.length === 0"
      icon="📋"
      text="暂无成就定义，请先前往成就管理创建"
    />

    <template v-else>
      <!-- 成就选择器 -->
      <div class="mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        <div class="flex gap-2 min-w-max">
          <button
            v-for="ach in achievements"
            :key="ach.id"
            class="px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap"
            :class="selectedAchId === ach.id
              ? 'bg-lol-primary text-white border-lol-primary'
              : 'bg-lol-card text-lol-muted border-lol-border hover:border-lol-primary hover:text-lol-text'"
            @click="selectedAchId = ach.id"
          >
            {{ ach.name }}
          </button>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="mb-4">
        <div class="flex items-center gap-3">
          <div class="flex-1 h-2 bg-lol-border rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="achProgress.completed === achProgress.total && achProgress.total > 0 ? 'bg-lol-gold' : 'bg-lol-primary'"
              :style="{ width: achProgressPercent + '%' }"
            />
          </div>
          <span class="text-sm text-lol-muted tabular-nums shrink-0">
            {{ achProgress.completed }} / {{ achProgress.total }}
          </span>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="mb-4">
        <HeroSearch v-model="keyword" />
      </div>

      <!-- 英雄网格 -->
      <EmptyState v-if="filteredHeroes.length === 0" icon="🔍" text="没有找到匹配的英雄" />

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <AchievementHeroCard
          v-for="item in filteredHeroes"
          :key="item.hero.heroId"
          :hero="item.hero"
          :completed="item.completed"
          :completed-at="item.completedAt"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAchievementStore } from '../../stores/achievement'
import { useRecordStore } from '../../stores/record'
import { useHeroStore } from '../../stores/hero'
import { createSearchEngine } from '../../utils/search'
import AchievementHeroCard from './AchievementHeroCard.vue'
import HeroSearch from '../hero/HeroSearch.vue'
import EmptyState from '../common/EmptyState.vue'

const achievementStore = useAchievementStore()
const recordStore = useRecordStore()
const heroStore = useHeroStore()

const selectedAchId = ref('')
const keyword = ref('')
let searchEngine = null

const achievements = computed(() => achievementStore.achievements)

// 默认选中第一个成就
watch(achievements, (achs) => {
  if (achs.length > 0 && !achs.find(a => a.id === selectedAchId.value)) {
    selectedAchId.value = achs[0].id
  }
  if (achs.length === 0) {
    selectedAchId.value = ''
  }
}, { immediate: true })

// 构建搜索引擎
watch(() => heroStore.heroes, (heroes) => {
  if (heroes.length > 0) {
    searchEngine = createSearchEngine(heroes)
  }
}, { immediate: true })

// 英雄完成状态列表（排序：已完成在前）
const heroStatusList = computed(() => {
  if (!selectedAchId.value || heroStore.heroes.length === 0) return []
  const achId = selectedAchId.value
  return heroStore.heroes.map(hero => {
    const record = recordStore.getRecord(hero.heroId, achId)
    return {
      hero,
      completed: record.completed,
      completedAt: record.completedAt || '',
    }
  }).sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? -1 : 1
  })
})

// 搜索过滤
const filteredHeroes = computed(() => {
  if (!keyword.value.trim()) return heroStatusList.value
  if (!searchEngine) return heroStatusList.value
  const results = searchEngine.search(keyword.value).map(r => r.item.heroId)
  const resultSet = new Set(results)
  return heroStatusList.value.filter(item => resultSet.has(item.hero.heroId))
})

// 成就进度
const achProgress = computed(() => {
  if (!selectedAchId.value) return { completed: 0, total: 0 }
  const heroIds = heroStore.heroes.map(h => h.heroId)
  return recordStore.getAchProgress(selectedAchId.value, heroIds)
})

const achProgressPercent = computed(() =>
  achProgress.value.total === 0 ? 0 : (achProgress.value.completed / achProgress.value.total) * 100
)

onMounted(() => heroStore.fetchHeroes())
</script>
