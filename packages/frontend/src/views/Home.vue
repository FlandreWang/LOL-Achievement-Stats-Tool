<template>
  <div>
    <!-- 视图切换 -->
    <div class="flex items-center gap-2 mb-4">
      <button
        class="px-4 py-1.5 text-sm rounded-full border transition-colors"
        :class="viewMode === 'hero'
          ? 'bg-lol-primary text-white border-lol-primary'
          : 'bg-lol-card text-lol-muted border-lol-border hover:border-lol-primary hover:text-lol-text'"
        @click="viewMode = 'hero'"
      >
        英雄
      </button>
      <button
        class="px-4 py-1.5 text-sm rounded-full border transition-colors"
        :class="viewMode === 'achievement'
          ? 'bg-lol-primary text-white border-lol-primary'
          : 'bg-lol-card text-lol-muted border-lol-border hover:border-lol-primary hover:text-lol-text'"
        @click="viewMode = 'achievement'"
      >
        成就
      </button>
    </div>

    <!-- 英雄维度视图 -->
    <div v-show="viewMode === 'hero'">
      <div class="flex items-center gap-3 mb-5">
        <div class="flex-1">
          <HeroSearch v-model="keyword" />
        </div>
        <!-- 排序选择器 -->
        <HeroSortSelect v-model="sortBy" />
        <!-- 布局切换按钮 -->
        <div class="flex items-center gap-1 bg-lol-card border border-lol-border rounded-lg p-1">
          <button
            class="p-1.5 rounded transition-colors"
            :class="heroLayout === 'grid' ? 'bg-lol-primary text-white' : 'text-lol-muted hover:text-lol-text'"
            @click="heroLayout = 'grid'"
          >
            <Grid3X3 class="w-4 h-4" />
          </button>
          <button
            class="p-1.5 rounded transition-colors"
            :class="heroLayout === 'list' ? 'bg-lol-primary text-white' : 'text-lol-muted hover:text-lol-text'"
            @click="heroLayout = 'list'"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>
      <HeroGrid v-if="heroLayout === 'grid'" :heroes="filteredHeroes" :loading="heroStore.loading" />
      <HeroList v-else :heroes="filteredHeroes" :loading="heroStore.loading" />
      <div v-if="heroStore.error" class="mt-4 text-center text-red-400 text-sm">
        {{ heroStore.error }}
      </div>
    </div>

    <!-- 成就维度视图 -->
    <div v-show="viewMode === 'achievement'">
      <AchievementView />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useHeroStore } from '../stores/hero'
import { useAchievementStore } from '../stores/achievement'
import { useRecordStore } from '../stores/record'
import { Grid3X3, List } from 'lucide-vue-next'
import { pinyin } from 'pinyin-pro'
import HeroGrid from '../components/hero/HeroGrid.vue'
import HeroList from '../components/hero/HeroList.vue'
import HeroSearch from '../components/hero/HeroSearch.vue'
import HeroSortSelect from '../components/hero/HeroSortSelect.vue'
import AchievementView from '../components/achievement/AchievementView.vue'
import { createSearchEngine } from '../utils/search'
import { useLayoutPreference } from '../composables/useLayoutPreference'

const heroStore = useHeroStore()
const achievementStore = useAchievementStore()
const recordStore = useRecordStore()
const viewMode = ref('hero')
const keyword = ref('')
const heroLayout = useLayoutPreference('lol_hero_layout', 'grid')
const sortBy = useLayoutPreference('lol_hero_sort', 'default')
let searchEngine = null

// 拼音缓存
const pinyinCache = new Map()

function getPinyin(text) {
  if (!pinyinCache.has(text)) {
    pinyinCache.set(text, pinyin(text, { toneType: 'none' }).toLowerCase())
  }
  return pinyinCache.get(text)
}

// 获取英雄成就完成数
function getAchievementCount(heroId) {
  const heroRecs = recordStore.records[heroId] || {}
  return Object.values(heroRecs).filter(r => r.completed).length
}

watch(() => heroStore.heroes, (heroes) => {
  if (heroes.length > 0) {
    searchEngine = createSearchEngine(heroes)
  }
}, { immediate: true })

// 排序后的英雄列表
const sortedHeroes = computed(() => {
  const heroes = [...heroStore.heroes]

  switch (sortBy.value) {
    case 'default':
      return heroes.sort((a, b) => Number(a.heroId) - Number(b.heroId))

    case 'pinyin-asc':
      return heroes.sort((a, b) => getPinyin(a.title).localeCompare(getPinyin(b.title)))

    case 'pinyin-desc':
      return heroes.sort((a, b) => getPinyin(b.title).localeCompare(getPinyin(a.title)))

    case 'alias-asc':
      return heroes.sort((a, b) => a.alias.localeCompare(b.alias))

    case 'alias-desc':
      return heroes.sort((a, b) => b.alias.localeCompare(a.alias))

    case 'name-asc':
      return heroes.sort((a, b) => a.name.localeCompare(b.name))

    case 'name-desc':
      return heroes.sort((a, b) => b.name.localeCompare(a.name))

    case 'achievements-desc':
      return heroes.sort((a, b) => getAchievementCount(b.heroId) - getAchievementCount(a.heroId))

    case 'achievements-asc':
      return heroes.sort((a, b) => getAchievementCount(a.heroId) - getAchievementCount(b.heroId))

    default:
      return heroes
  }
})

const filteredHeroes = computed(() => {
  if (!keyword.value.trim()) return sortedHeroes.value
  if (!searchEngine) return sortedHeroes.value
  const results = searchEngine.search(keyword.value).map(r => r.item.heroId)
  const resultSet = new Set(results)
  return sortedHeroes.value.filter(hero => resultSet.has(hero.heroId))
})

onMounted(() => {
  heroStore.fetchHeroes()
  achievementStore.fetchAll()
  recordStore.fetchAll()
})
</script>
