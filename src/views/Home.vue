<template>
  <div>
    <div class="mb-5">
      <HeroSearch v-model="keyword" />
    </div>
    <HeroGrid :heroes="filteredHeroes" :loading="heroStore.loading" />
    <div v-if="heroStore.error" class="mt-4 text-center text-red-400 text-sm">
      {{ heroStore.error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHeroStore } from '../stores/hero'
import HeroGrid from '../components/hero/HeroGrid.vue'
import HeroSearch from '../components/hero/HeroSearch.vue'
import { createSearchEngine } from '../utils/search'

const heroStore = useHeroStore()
const keyword = ref('')

let searchEngine = null

const filteredHeroes = computed(() => {
  if (!keyword.value.trim()) return heroStore.heroes
  if (!searchEngine) return heroStore.heroes
  return searchEngine.search(keyword.value).map(r => r.item)
})

onMounted(async () => {
  await heroStore.fetchHeroes()
  searchEngine = createSearchEngine(heroStore.heroes)
})
</script>
