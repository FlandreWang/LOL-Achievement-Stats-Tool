import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchHeroesWithFallback } from '../utils/crawler'
import { KEYS, get, set } from '../utils/storage'

export const useHeroStore = defineStore('hero', () => {
  const heroes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const heroMap = computed(() => {
    const map = {}
    heroes.value.forEach(h => { map[h.heroId] = h })
    return map
  })

  function getHeroById(id) {
    return heroMap.value[id]
  }

  async function fetchHeroes() {
    if (heroes.value.length > 0) return
    loading.value = true
    error.value = null
    try {
      const cached = get(KEYS.HEROES)
      if (cached && cached.length > 0) {
        heroes.value = cached
      }
      const data = await fetchHeroesWithFallback()
      heroes.value = data
      set(KEYS.HEROES, data)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function refreshHeroes() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchHeroesWithFallback()
      heroes.value = data
      set(KEYS.HEROES, data)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { heroes, loading, error, getHeroById, fetchHeroes, refreshHeroes }
})
