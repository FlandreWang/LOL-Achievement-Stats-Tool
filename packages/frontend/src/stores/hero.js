import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { heroApi } from '../services/api'

export const useHeroStore = defineStore('hero', () => {
  const heroes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const cacheStatus = ref(null)

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
      heroes.value = await heroApi.getAll()
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
      heroes.value = await heroApi.refresh()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchCacheStatus() {
    try {
      cacheStatus.value = await heroApi.getStatus()
    } catch (e) {
      console.error('获取缓存状态失败:', e)
    }
  }

  return { heroes, loading, error, cacheStatus, getHeroById, fetchHeroes, refreshHeroes, fetchCacheStatus }
})
