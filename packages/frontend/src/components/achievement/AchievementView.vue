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

      <!-- 酷炫进度展示 -->
      <AchievementProgress
        class="mb-4"
        :completed="achProgress.completed"
        :total="achProgress.total"
        :achievement-name="selectedAchName"
      />

      <!-- 搜索框 + 布局切换 -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1">
          <HeroSearch v-model="keyword" />
        </div>
        <div class="flex items-center gap-1 bg-lol-card border border-lol-border rounded-lg p-1">
          <button
            class="p-1.5 rounded transition-colors"
            :class="achLayout === 'grid' ? 'bg-lol-primary text-white' : 'text-lol-muted hover:text-lol-text'"
            @click="achLayout = 'grid'"
          >
            <Grid3X3 class="w-4 h-4" />
          </button>
          <button
            class="p-1.5 rounded transition-colors"
            :class="achLayout === 'list' ? 'bg-lol-primary text-white' : 'text-lol-muted hover:text-lol-text'"
            @click="achLayout = 'list'"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 英雄网格/列表 -->
      <EmptyState v-if="filteredHeroes.length === 0" icon="🔍" text="没有找到匹配的英雄" />

      <template v-else>
        <div v-if="achLayout === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <AchievementHeroCard
            v-for="item in filteredHeroes"
            :key="item.hero.heroId"
            :hero="item.hero"
            :completed="item.completed"
            :completed-at="item.completedAt"
          />
        </div>
        <div v-else class="space-y-1.5">
          <HeroListCard
            v-for="item in filteredHeroes"
            :key="item.hero.heroId"
            :hero="item.hero"
            :completed="item.completed"
            :completed-at="item.completedAt"
            compact
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Grid3X3, List } from 'lucide-vue-next'
import { useAchievementStore } from '../../stores/achievement'
import { useRecordStore } from '../../stores/record'
import { useHeroStore } from '../../stores/hero'
import { createSearchEngine } from '../../utils/search'
import { useLayoutPreference } from '../../composables/useLayoutPreference'
import AchievementProgress from './AchievementProgress.vue'
import AchievementHeroCard from './AchievementHeroCard.vue'
import HeroListCard from '../hero/HeroListCard.vue'
import HeroSearch from '../hero/HeroSearch.vue'
import EmptyState from '../common/EmptyState.vue'

const achievementStore = useAchievementStore()
const recordStore = useRecordStore()
const heroStore = useHeroStore()

const selectedAchId = ref('')
const keyword = ref('')
const achLayout = useLayoutPreference('lol_achievement_layout', 'list')
let searchEngine = null

const achievements = computed(() => achievementStore.achievements)

// 选中成就名称
const selectedAchName = computed(() => {
  const ach = achievements.value.find(a => a.id === selectedAchId.value)
  return ach ? ach.name : ''
})

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

onMounted(() => heroStore.fetchHeroes())
</script>
