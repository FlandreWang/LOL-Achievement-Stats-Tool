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
      <div class="mb-5">
        <HeroSearch v-model="keyword" />
      </div>
      <HeroGrid :heroes="filteredHeroes" :loading="heroStore.loading" />
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
import HeroGrid from '../components/hero/HeroGrid.vue'
import HeroSearch from '../components/hero/HeroSearch.vue'
import AchievementView from '../components/achievement/AchievementView.vue'
import { createSearchEngine } from '../utils/search'

const heroStore = useHeroStore()
const viewMode = ref('hero')
const keyword = ref('')
let searchEngine = null

watch(() => heroStore.heroes, (heroes) => {
  if (heroes.length > 0) {
    searchEngine = createSearchEngine(heroes)
  }
}, { immediate: true })

const filteredHeroes = computed(() => {
  if (!keyword.value.trim()) return heroStore.heroes
  if (!searchEngine) return heroStore.heroes
  return searchEngine.search(keyword.value).map(r => r.item)
})

onMounted(() => heroStore.fetchHeroes())
</script>
