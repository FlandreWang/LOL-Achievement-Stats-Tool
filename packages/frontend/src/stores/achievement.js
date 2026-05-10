import { defineStore } from 'pinia'
import { ref } from 'vue'
import { achievementApi } from '../services/api'

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      achievements.value = await achievementApi.getAll()
    } catch (e) {
      console.error('获取成就列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function add({ name, description = '' }) {
    const id = 'ach_' + Date.now()
    await achievementApi.create({ id, name, description })
    achievements.value.unshift({ id, name, description, created_at: new Date().toISOString() })
    return id
  }

  async function update(id, data) {
    await achievementApi.update(id, data)
    const ach = achievements.value.find(a => a.id === id)
    if (ach) Object.assign(ach, data)
  }

  async function remove(id) {
    await achievementApi.delete(id)
    achievements.value = achievements.value.filter(a => a.id !== id)
  }

  return { achievements, loading, fetchAll, add, update, remove }
})
